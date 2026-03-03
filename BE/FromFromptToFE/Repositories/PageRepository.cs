using System;
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Repositories
{
    public class PageRepository : Repository<Page>, IPageRepository
    {
        public PageRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Page>> GetPagesByProjectOutputIdAsync(Guid projectOutputId)
        {
            return await _dbSet
                .Where(x => x.ProjectOutputId == projectOutputId)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Page> Items, int TotalCount)> GetPagedByProjectOutputIdAsync(Guid projectOutputId, string? search, string? pageType, string? entityName, string? sortBy, string? sortOrder, int pageIndex, int pageSize)
        {
            var query = _dbSet.Where(x => x.ProjectOutputId == projectOutputId);

            if (!string.IsNullOrEmpty(pageType))
                query = query.Where(x => x.PageType != null && x.PageType.Contains(pageType));
            if (!string.IsNullOrEmpty(entityName))
                query = query.Where(x => x.EntityName != null && x.EntityName.Contains(entityName));
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(x =>
                    (x.Route != null && x.Route.Contains(search)) ||
                    (x.PageType != null && x.PageType.Contains(search)) ||
                    (x.EntityName != null && x.EntityName.Contains(search)));
            }

            var isDesc = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            query = (sortBy?.ToLowerInvariant()) switch
            {
                "route" => isDesc ? query.OrderByDescending(x => x.Route) : query.OrderBy(x => x.Route),
                "pagetype" => isDesc ? query.OrderByDescending(x => x.PageType) : query.OrderBy(x => x.PageType),
                "entityname" => isDesc ? query.OrderByDescending(x => x.EntityName) : query.OrderBy(x => x.EntityName),
                _ => isDesc ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }
    }
}
