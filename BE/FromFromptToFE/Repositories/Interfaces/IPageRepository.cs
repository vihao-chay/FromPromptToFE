using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories.Interfaces
{
    public interface IPageRepository : IRepository<Page>
    {
        Task<IEnumerable<Page>> GetPagesByProjectOutputIdAsync(Guid projectOutputId);
        Task<(IEnumerable<Page> Items, int TotalCount)> GetPagedByProjectOutputIdAsync(Guid projectOutputId, string? search, string? pageType, string? entityName, string? sortBy, string? sortOrder, int pageIndex, int pageSize);
    }
}
