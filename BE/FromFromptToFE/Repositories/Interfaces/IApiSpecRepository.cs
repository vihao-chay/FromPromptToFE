using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories
{
    public interface IApiSpecRepository : IRepository<ApiSpec>
    {
        Task<(IEnumerable<ApiSpec> Items, int TotalCount)> GetPagedAsync(
            string? search, Guid? projectId, string? specType, string? sortBy, string? sortOrder, int pageIndex, int pageSize);
    }
}
