using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories.Interfaces
{
    public interface IProjectOutputRepository : IRepository<ProjectOutput>
    {
        Task<IEnumerable<ProjectOutput>> GetAllByProjectIdAsync(Guid projectId);
        Task<(IEnumerable<ProjectOutput> Items, int TotalCount)> GetPagedByProjectIdAsync(Guid projectId, string? search, string? status, string? sortBy, string? sortOrder, int pageIndex, int pageSize);
        Task<ProjectOutput?> GetProjectOutputWithDetailsAsync(Guid id);
    }
}
