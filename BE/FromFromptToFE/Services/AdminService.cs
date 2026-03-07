using FromFromptToFE.Base;
using FromFromptToFE.Data;
using FromFromptToFE.DTOs.Admin;
using FromFromptToFE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Services
{
    public class AdminService : IAdminService
    {
        private readonly PostgresContext _context;

        public AdminService(PostgresContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var verifiedUsers = await _context.Users.CountAsync(u => u.IsVerified == true);
            var totalOrgs = await _context.Organizations.CountAsync();
            var totalProjects = await _context.Projects.CountAsync();
            var totalAIGenerations = await _context.ProjectOutputs.CountAsync();

            // Project types for Pie Chart
            var projectTypes = await _context.Projects
                .GroupBy(p => p.ProjectType)
                .Select(g => new ChartDataPointDto { Name = string.IsNullOrEmpty(g.Key) ? "Unknown" : g.Key, Value = g.Count() })
                .ToListAsync();

            if (projectTypes.Count == 0 && totalProjects > 0)
                projectTypes.Add(new ChartDataPointDto { Name = "Web App", Value = totalProjects });

             // User growth for last 7 days (Line Chart)
            var weekAgo = DateTime.UtcNow.AddDays(-6).Date;
            var recentUsers = await _context.Users
                .Where(u => u.CreatedAt >= weekAgo)
                .Select(u => new { u.CreatedAt })
                .ToListAsync();

            var groupedGrowth = recentUsers
                .GroupBy(u => u.CreatedAt?.Date ?? DateTime.UtcNow.Date)
                .ToDictionary(g => g.Key.ToString("MMM dd"), g => g.Count());

            var userGrowth = new List<ChartDataPointDto>();
            for (int i = 6; i >= 0; i--)
            {
                var dateStr = DateTime.UtcNow.AddDays(-i).ToString("MMM dd");
                userGrowth.Add(new ChartDataPointDto
                {
                    Name = dateStr,
                    Value = groupedGrowth.ContainsKey(dateStr) ? groupedGrowth[dateStr] : 0
                });
            }

            // Mock Global AI Tokens Logic (assuming limit is 1,000,000 across all system generations)
            var totalTokensLimit = 1000000;
            var averageTokensPerGen = 850; 
            var totalTokensUsed = totalAIGenerations * averageTokensPerGen;

            return new DashboardStatsDto
            {
                TotalUsers = totalUsers,
                VerifiedUsers = verifiedUsers,
                UnverifiedUsers = totalUsers - verifiedUsers,
                TotalOrganizations = totalOrgs,
                TotalProjects = totalProjects,
                TotalAIGenerations = totalAIGenerations,
                TotalTokensUsed = totalTokensUsed,
                TotalTokensRemaining = Math.Max(0, totalTokensLimit - totalTokensUsed),
                ProjectsByType = projectTypes,
                UserGrowth = userGrowth
            };
        }

        public async Task<PagingResult<AdminUserDto>> GetUsersAsync(AdminUserFilterDto filter)
        {
            var query = _context.Users.AsQueryable();

            // Search by name or email
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(u =>
                    u.Email.ToLower().Contains(search) ||
                    (u.Name != null && u.Name.ToLower().Contains(search)));
            }

            var totalRow = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Name = u.Name,
                    AvatarUrl = u.AvatarUrl,
                    Provider = u.Provider,
                    IsVerified = u.IsVerified ?? false,
                    IsAdmin = u.IsAdmin,
                    IsActive = u.IsVerified ?? false, // using IsVerified as active status
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .ToListAsync();

            return new PagingResult<AdminUserDto>
            {
                TotalItems = users,
                TotalRow = totalRow,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        public async Task<bool> ToggleUserStatusAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Toggle IsVerified as the active/inactive flag
            user.IsVerified = !(user.IsVerified ?? false);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PagingResult<AdminProjectDto>> GetProjectsAsync(AdminProjectFilterDto filter)
        {
            var query = _context.Projects
                .Include(p => p.Organization)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(search) ||
                    p.Organization.Name.ToLower().Contains(search));
            }

            var totalRow = await query.CountAsync();

            var projects = await query
                .Include(p => p.ProjectOutputs)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(p => new AdminProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    ProjectType = p.ProjectType,
                    OrganizationId = p.OrganizationId,
                    OrganizationName = p.Organization.Name,
                    CreatedAt = p.CreatedAt,
                    HasGeneratedCode = p.ProjectOutputs.Any(o => o.GeneratedTsx != null || o.GeneratedHtml != null)
                })
                .ToListAsync();

            return new PagingResult<AdminProjectDto>
            {
                TotalItems = projects,
                TotalRow = totalRow,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        // === NEW ADMIN CRUD METHODS ===
        public async Task<AdminUserDto> CreateUserAsync(CreateAdminUserDto dto)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (existingUser != null)
                throw new Exception("Email already exists.");

            var newUser = new FromFromptToFE.Models.User
            {
                Email = dto.Email,
                Name = dto.Name,
                PasswordHash = FromFromptToFE.Helpers.PasswordHelper.HashPassword(dto.Password),
                IsAdmin = dto.IsAdmin,
                IsVerified = true, // Default to Active
                Provider = "local",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return new AdminUserDto
            {
                Id = newUser.Id,
                Email = newUser.Email,
                Name = newUser.Name,
                AvatarUrl = newUser.AvatarUrl,
                Provider = newUser.Provider,
                IsVerified = newUser.IsVerified ?? false,
                IsAdmin = newUser.IsAdmin,
                IsActive = newUser.IsVerified ?? false,
                CreatedAt = newUser.CreatedAt,
                UpdatedAt = newUser.UpdatedAt
            };
        }

        public async Task<AdminUserDto?> UpdateUserAsync(Guid userId, UpdateAdminUserDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            // Optional check: if email is updated, ensure no clash
            if (user.Email.ToLower() != dto.Email.ToLower())
            {
                var emailTaken = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower() && u.Id != userId);
                if (emailTaken) throw new Exception("Email is already taken by another user.");
            }

            user.Name = dto.Name;
            user.Email = dto.Email;
            user.IsAdmin = dto.IsAdmin;
            user.IsVerified = dto.Status.Equals("Active", StringComparison.OrdinalIgnoreCase);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new AdminUserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                AvatarUrl = user.AvatarUrl,
                Provider = user.Provider,
                IsVerified = user.IsVerified ?? false,
                IsAdmin = user.IsAdmin,
                IsActive = user.IsVerified ?? false,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUsersBulkAsync(List<Guid> userIds)
        {
            if (userIds == null || !userIds.Any()) return false;
            var users = await _context.Users.Where(u => userIds.Contains(u.Id)).ToListAsync();
            _context.Users.RemoveRange(users);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteProjectAsync(Guid projectId)
        {
            var project = await _context.Projects
                .Include(p => p.ApiSpecs)
                .Include(p => p.ProjectOutputs)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return false;

            // Remove related entities first
            _context.ApiSpecs.RemoveRange(project.ApiSpecs);
            _context.ProjectOutputs.RemoveRange(project.ProjectOutputs);
            _context.Projects.Remove(project);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteProjectsBulkAsync(List<Guid> projectIds)
        {
            if (projectIds == null || !projectIds.Any()) return false;
            var projects = await _context.Projects
                .Include(p => p.ApiSpecs)
                .Include(p => p.ProjectOutputs)
                .Where(p => projectIds.Contains(p.Id)).ToListAsync();

            foreach (var project in projects)
            {
                _context.ApiSpecs.RemoveRange(project.ApiSpecs);
                _context.ProjectOutputs.RemoveRange(project.ProjectOutputs);
            }
            _context.Projects.RemoveRange(projects);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AdminProjectPreviewDto?> GetProjectPreviewAsync(Guid projectId)
        {
            var project = await _context.Projects
                .Include(p => p.Organization)
                .Include(p => p.ProjectOutputs)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return null;

            // Get latest output
            var latestOutput = project.ProjectOutputs.OrderByDescending(o => o.CreatedAt).FirstOrDefault();

            return new AdminProjectPreviewDto
            {
                Id = project.Id,
                Name = project.Name,
                OrganizationName = project.Organization?.Name,
                SystemPrompt = latestOutput?.SystemPrompt,
                UserPrompt = latestOutput?.UserPrompt,
                PromptHistory = latestOutput?.PromptHistory,
                GeneratedTsx = latestOutput?.GeneratedTsx,
                GeneratedHtml = latestOutput?.GeneratedHtml
            };
        }
    }
}
