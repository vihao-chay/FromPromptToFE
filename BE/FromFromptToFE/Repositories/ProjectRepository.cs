using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Repositories
{
    public class ProjectRepository : Repository<Project>, IProjectRepository
    {
        public ProjectRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Project> Items, int TotalCount)> GetPagedAsync(
            string? search, Guid? organizationId, string? projectType, string? sortBy, string? sortOrder, int pageIndex, int pageSize)
        {
            var query = _dbSet.AsQueryable();

            if (organizationId.HasValue)
                query = query.Where(p => p.OrganizationId == organizationId.Value);
            if (!string.IsNullOrEmpty(projectType))
                query = query.Where(p => p.ProjectType == projectType);
            if (!string.IsNullOrEmpty(search))
            {
                var isGuid = Guid.TryParse(search, out var guidSearch);
                query = query.Where(p =>
                    (isGuid && p.Id == guidSearch) ||
                    (p.Name != null && p.Name.Contains(search)) ||
                    (p.ProjectType != null && p.ProjectType.Contains(search)));
            }

            var isDesc = string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase) ? false : true;
            query = (sortBy?.ToLowerInvariant()) switch
            {
                "name" => isDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
                "projecttype" => isDesc ? query.OrderByDescending(p => p.ProjectType) : query.OrderBy(p => p.ProjectType),
                _ => isDesc ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }
    }
}
