using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Repositories;

public class CodeRepository : Repository<Code>, ICodeRepository
{
    public CodeRepository(PostgresContext context) : base(context)
    {
    }

    public async Task<(IEnumerable<Code> Items, int TotalCount)> GetPagedAsync(
        string? search, Guid? userId, string? status, int pageIndex, int pageSize)
    {
        var query = _dbSet.AsQueryable();

        if (userId.HasValue)
            query = query.Where(c => c.UserId == userId.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(c => c.Status != null && c.Status == status);

        if (!string.IsNullOrEmpty(search))
        {
            var isGuid = Guid.TryParse(search, out var guidSearch);
            query = query.Where(c =>
                (isGuid && c.Id == guidSearch) ||
                (c.RepoName != null && c.RepoName.Contains(search)) ||
                (c.ProjectName != null && c.ProjectName.Contains(search)) ||
                (c.Description != null && c.Description.Contains(search)));
        }

        query = query.OrderByDescending(c => c.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
