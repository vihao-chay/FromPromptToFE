using System;
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Repositories
{
    public class OrganizationRepository : Repository<Organization>, IOrganizationRepository
    {
        public OrganizationRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Organization> Items, int TotalCount)> GetPagedAsync(string? search, string? sortBy, string? sortOrder, int pageIndex, int pageSize)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var isGuid = Guid.TryParse(search, out var guidSearch);
                query = query.Where(o =>
                    (isGuid && o.Id == guidSearch) ||
                    (o.Name != null && o.Name.Contains(search)) ||
                    (o.Plan != null && o.Plan.Contains(search)));
            }

            var isDesc = !string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);
            query = (sortBy?.ToLowerInvariant()) switch
            {
                "name" => isDesc ? query.OrderByDescending(o => o.Name) : query.OrderBy(o => o.Name),
                "plan" => isDesc ? query.OrderByDescending(o => o.Plan) : query.OrderBy(o => o.Plan),
                _ => isDesc ? query.OrderByDescending(o => o.CreatedAt) : query.OrderBy(o => o.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }
    }
}
