using FromFromptToFE.Models;
using System;

namespace FromFromptToFE.Repositories
{
    public interface IChangeLogRepository : IRepository<ChangeLog>
    {
        Task<(IEnumerable<ChangeLog> Items, int TotalCount)> GetPagedAsync(string? search, Guid? organizationId, string? entityType, Guid? entityId, string? action, string? sortBy, string? sortOrder, int pageIndex, int pageSize);
    }
}
