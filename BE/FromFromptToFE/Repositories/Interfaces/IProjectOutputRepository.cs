using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories.Interfaces
{
    public interface IProjectOutputRepository : IRepository<ProjectOutput>
    {
        Task<IEnumerable<ProjectOutput>> GetAllByProjectIdAsync(Guid projectId);
        Task<ProjectOutput?> GetProjectOutputWithDetailsAsync(Guid id);
    }
}
