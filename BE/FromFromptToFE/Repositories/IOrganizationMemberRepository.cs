using FromFromptToFE.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FromFromptToFE.Repositories
{
    public interface IOrganizationMemberRepository : IRepository<OrganizationMember>
    {
        Task<(IEnumerable<OrganizationMember> Items, int TotalCount)> GetPagedMembersAsync(Guid organizationId, string? search, int pageIndex, int pageSize);
        Task<IEnumerable<OrganizationMember>> GetByUserIdAsync(Guid userId);
        Task<OrganizationMember?> FindByInviteTokenAsync(string token);
    }
}
