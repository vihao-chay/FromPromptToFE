using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace FromFromptToFE.Repositories
{
    public class ChangeLogRepository : Repository<ChangeLog>, IChangeLogRepository
    {
        public ChangeLogRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<ChangeLog> Items, int TotalCount)> GetPagedAsync(Guid? organizationId, int pageIndex, int pageSize)
        {
            var query = _dbSet.AsQueryable();
            if (organizationId.HasValue)
                query = query.Where(c => c.OrganizationId == organizationId.Value);
            query = query.OrderByDescending(c => c.CreatedAt);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (items, totalCount);
        }
    }
}
