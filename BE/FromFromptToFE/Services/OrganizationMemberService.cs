using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FromFromptToFE.Services
{
    public class OrganizationMemberService : IOrganizationMemberService
    {
        private readonly IOrganizationMemberRepository _repository;
        private readonly IMapper _mapper;

        public OrganizationMemberService(IOrganizationMemberRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<PagingResult<OrganizationMemberDto>> GetMembersByOrgIdAsync(Guid organizationId, MemberFilterDto filter)
        {
            var (items, totalCount) = await _repository.GetPagedMembersAsync(
                organizationId,
                filter.Search,
                filter.PageIndex,
                filter.PageSize);

            return new PagingResult<OrganizationMemberDto>
            {
                TotalItems = _mapper.Map<List<OrganizationMemberDto>>(items),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        public async Task<OrganizationMemberDto> AddMemberAsync(AddMemberDto addDto)
        {
            var member = _mapper.Map<OrganizationMember>(addDto);
            member.CreatedAt = DateTime.UtcNow;
            
            await _repository.AddAsync(member);
            
            // Re-fetch to get User details for the DTO
            var addedMember = await _repository.GetPagedMembersAsync(member.OrganizationId, member.UserId.ToString(), 1, 1);
            return _mapper.Map<OrganizationMemberDto>(addedMember.Items.FirstOrDefault());
        }

        public async Task<bool> UpdateMemberRoleAsync(Guid memberId, UpdateMemberRoleDto updateDto)
        {
            var member = await _repository.GetByIdAsync(memberId);
            if (member == null) return false;

            member.Role = updateDto.Role.ToString();
            await _repository.UpdateAsync(member);
            return true;
        }

        public async Task<bool> RemoveMemberAsync(Guid memberId)
        {
            var member = await _repository.GetByIdAsync(memberId);
            if (member == null) return false;

            await _repository.DeleteAsync(member);
            return true;
        }

        public async Task<IEnumerable<UserOrganizationDto>> GetOrganizationsByUserIdAsync(Guid userId)
        {
            var memberships = await _repository.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<UserOrganizationDto>>(memberships);
        }
    }
}
