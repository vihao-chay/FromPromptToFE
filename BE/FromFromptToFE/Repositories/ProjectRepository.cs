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
            string? search, Guid? organizationId, string? projectType, int pageIndex, int pageSize)
        {
            var query = _dbSet.AsQueryable();

            if (organizationId.HasValue)
            {
                query = query.Where(p => p.OrganizationId == organizationId.Value);
            }

            if (!string.IsNullOrEmpty(projectType))
            {
                query = query.Where(p => p.ProjectType == projectType);
            }

            if (!string.IsNullOrEmpty(search))
            {
                var isGuid = Guid.TryParse(search, out var guidSearch);
                query = query.Where(p =>
                    (isGuid && p.Id == guidSearch) ||
                    p.Name.Contains(search) ||
                    p.ProjectType.Contains(search));
            }

            query = query.OrderByDescending(p => p.CreatedAt);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize)
                                   .Take(pageSize)
                                   .ToListAsync();

            return (items, totalCount);
        }
    }
}
