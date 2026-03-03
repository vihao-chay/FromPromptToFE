using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories;

public interface ICodeRepository : IRepository<Code>
{
    Task<(IEnumerable<Code> Items, int TotalCount)> GetPagedAsync(
        string? search, Guid? userId, string? status, int pageIndex, int pageSize);
}
