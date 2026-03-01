using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories.Interfaces
{
    public interface IPageRepository : IRepository<Page>
    {
        Task<IEnumerable<Page>> GetPagesByProjectOutputIdAsync(Guid projectOutputId);
    }
}
