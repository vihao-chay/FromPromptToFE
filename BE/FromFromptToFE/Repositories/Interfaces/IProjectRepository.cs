using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories
{
    public interface IProjectRepository : IRepository<Project>
    {
        Task<(IEnumerable<Project> Items, int TotalCount)> GetPagedAsync(
            string? search, Guid? organizationId, string? projectType, int pageIndex, int pageSize);
    }
}
