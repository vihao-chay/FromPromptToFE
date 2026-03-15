using System;
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Repositories
{
    public class ApiSpecOutputRepository : Repository<ApiSpecOutput>, IApiSpecOutputRepository
    {
        public ApiSpecOutputRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<ApiSpecOutput> Items, int TotalCount)> GetPagedAsync(
            string? search, Guid? apiSpecId, string? version, string? sortBy, string? sortOrder, int pageIndex, int pageSize)
        {
            var query = _dbSet.AsQueryable();

            if (apiSpecId.HasValue)
                query = query.Where(a => a.ApiSpecId == apiSpecId.Value);
            if (!string.IsNullOrEmpty(version))
                query = query.Where(a => a.Version == version);
            if (!string.IsNullOrEmpty(search))
            {
                var isGuid = Guid.TryParse(search, out var guidSearch);
                query = query.Where(a =>
                    (isGuid && a.Id == guidSearch) ||
                    (a.Version != null && a.Version.Contains(search)) ||
                    (a.Content != null && a.Content.Contains(search)));
            }

            var isDesc = !string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);
            query = (sortBy?.ToLowerInvariant()) switch
            {
                "version" => isDesc ? query.OrderByDescending(a => a.Version) : query.OrderBy(a => a.Version),
                _ => isDesc ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }
    }
}
