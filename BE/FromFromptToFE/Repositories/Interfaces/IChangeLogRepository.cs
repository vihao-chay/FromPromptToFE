using FromFromptToFE.Models;
using System;

namespace FromFromptToFE.Repositories
{
    public interface IChangeLogRepository : IRepository<ChangeLog>
    {
        Task<(IEnumerable<ChangeLog> Items, int TotalCount)> GetPagedAsync(Guid? organizationId, int pageIndex, int pageSize);
    }
}
