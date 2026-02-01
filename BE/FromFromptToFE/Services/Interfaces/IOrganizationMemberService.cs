using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using System;
using System.Threading.Tasks;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IOrganizationMemberService
    {
        Task<PagingResult<OrganizationMemberDto>> GetMembersByOrgIdAsync(Guid organizationId, MemberFilterDto filter);
        Task<OrganizationMemberDto> AddMemberAsync(AddMemberDto addDto);
        Task<bool> UpdateMemberRoleAsync(Guid memberId, UpdateMemberRoleDto updateDto);
        Task<bool> RemoveMemberAsync(Guid memberId);
        Task<IEnumerable<UserOrganizationDto>> GetOrganizationsByUserIdAsync(Guid userId);
    }
}
