using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories
{
    public interface IApiSpecOutputRepository : IRepository<ApiSpecOutput>
    {
        Task<(IEnumerable<ApiSpecOutput> Items, int TotalCount)> GetPagedAsync(
            string? search, Guid? apiSpecId, string? version, string? sortBy, string? sortOrder, int pageIndex, int pageSize);
    }
}
