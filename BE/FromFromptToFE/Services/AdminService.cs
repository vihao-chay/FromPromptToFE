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

            return new DashboardStatsDto
            {
                TotalUsers = totalUsers,
                VerifiedUsers = verifiedUsers,
                UnverifiedUsers = totalUsers - verifiedUsers,
                TotalOrganizations = totalOrgs,
                TotalProjects = totalProjects,
                TotalAIGenerations = totalAIGenerations
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
    }
}
