using FromFromptToFE.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FromFromptToFE.Repositories
{
    public interface IOrganizationRepository : IRepository<Organization>
    {
        Task<(IEnumerable<Organization> Items, int TotalCount)> GetPagedAsync(string? search, string? sortBy, string? sortOrder, int pageIndex, int pageSize);
    }
}
