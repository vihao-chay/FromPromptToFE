using System;
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Repositories
{
    public class ChangeLogRepository : Repository<ChangeLog>, IChangeLogRepository
    {
        public ChangeLogRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<ChangeLog> Items, int TotalCount)> GetPagedAsync(string? search, Guid? organizationId, string? entityType, string? action, string? sortBy, string? sortOrder, int pageIndex, int pageSize)
        {
            var query = _dbSet.AsQueryable();
            if (organizationId.HasValue)
                query = query.Where(c => c.OrganizationId == organizationId.Value);
            if (!string.IsNullOrEmpty(entityType))
                query = query.Where(c => c.EntityType != null && c.EntityType.Contains(entityType));
            if (!string.IsNullOrEmpty(action))
                query = query.Where(c => c.Action != null && c.Action.Contains(action));
            if (!string.IsNullOrEmpty(search))
            {
                var isGuid = Guid.TryParse(search, out var guidSearch);
                query = query.Where(c =>
                    (isGuid && (c.Id == guidSearch || c.EntityId == guidSearch)) ||
                    (c.Action != null && c.Action.Contains(search)) ||
                    (c.EntityType != null && c.EntityType.Contains(search)));
            }

            var isDesc = !string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);
            query = (sortBy?.ToLowerInvariant()) switch
            {
                "action" => isDesc ? query.OrderByDescending(c => c.Action) : query.OrderBy(c => c.Action),
                "entitytype" => isDesc ? query.OrderByDescending(c => c.EntityType) : query.OrderBy(c => c.EntityType),
                _ => isDesc ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }
    }
}
