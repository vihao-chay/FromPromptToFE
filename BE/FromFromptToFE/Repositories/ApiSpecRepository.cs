using System;
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Repositories
{
    public class ApiSpecRepository : Repository<ApiSpec>, IApiSpecRepository
    {
        public ApiSpecRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<ApiSpec> Items, int TotalCount)> GetPagedAsync(
            string? search, Guid? projectId, string? specType, string? sortBy, string? sortOrder, int pageIndex, int pageSize)
        {
            var query = _dbSet.AsQueryable();

            if (projectId.HasValue)
                query = query.Where(a => a.ProjectId == projectId.Value);
            if (!string.IsNullOrEmpty(specType))
                query = query.Where(a => a.SpecType == specType);
            if (!string.IsNullOrEmpty(search))
            {
                var isGuid = Guid.TryParse(search, out var guidSearch);
                query = query.Where(a =>
                    (isGuid && a.Id == guidSearch) ||
                    (a.SpecType != null && a.SpecType.Contains(search)));
            }

            var isDesc = !string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);
            query = (sortBy?.ToLowerInvariant()) switch
            {
                "spectype" => isDesc ? query.OrderByDescending(a => a.SpecType) : query.OrderBy(a => a.SpecType),
                _ => isDesc ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }
    }
}
