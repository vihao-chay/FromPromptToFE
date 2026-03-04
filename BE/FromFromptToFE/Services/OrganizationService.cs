using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Enums;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Services.Interfaces;

namespace FromFromptToFE.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IOrganizationRepository _repository;
        private readonly IOrganizationMemberService _memberService;
        private readonly IMapper _mapper;

        public OrganizationService(IOrganizationRepository repository, IOrganizationMemberService memberService, IMapper mapper)
        {
            _repository = repository;
            _memberService = memberService;
            _mapper = mapper;
        }

        public async Task<PagingResult<OrganizationDto>> GetAllOrganizationsAsync(OrganizationFilterDto filter)
        {
            var (items, totalCount) = await _repository.GetPagedAsync(
                filter.Search,
                filter.SortBy,
                filter.SortOrder,
                filter.PageIndex,
                filter.PageSize);

            return new PagingResult<OrganizationDto>
            {
                TotalItems = _mapper.Map<List<OrganizationDto>>(items),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        public async Task<PagingResult<OrganizationDto>> GetOrganizationsByUserAsync(Guid userId, OrganizationFilterDto filter)
        {
            var (items, totalCount) = await _repository.GetPagedByUserAsync(
                userId,
                filter.Search,
                filter.SortBy,
                filter.SortOrder,
                filter.PageIndex,
                filter.PageSize);

            if (totalCount == 0)
            {
                var orphanOrgs = await _repository.GetOrganizationsWithNoMembersAsync();
                var firstOrphan = orphanOrgs.FirstOrDefault();
                if (firstOrphan != null)
                {
                    await _memberService.AddMemberAsync(new AddMemberDto
                    {
                        OrganizationId = firstOrphan.Id,
                        UserId = userId,
                        Role = OrganizationRole.Owner
                    });
                    (items, totalCount) = await _repository.GetPagedByUserAsync(
                        userId,
                        filter.Search,
                        filter.SortBy,
                        filter.SortOrder,
                        filter.PageIndex,
                        filter.PageSize);
                }
            }

            return new PagingResult<OrganizationDto>
            {
                TotalItems = _mapper.Map<List<OrganizationDto>>(items),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        public async Task<OrganizationDto?> GetOrganizationByIdAsync(Guid id)
        {
            var organization = await _repository.GetByIdAsync(id);
            return organization == null ? null : _mapper.Map<OrganizationDto>(organization);
        }

        public async Task<OrganizationDto> CreateOrganizationAsync(CreateOrganizationDto createDto)
        {
            var organization = _mapper.Map<Organization>(createDto);
            organization.CreatedAt = DateTime.UtcNow;
            await _repository.AddAsync(organization);
            return _mapper.Map<OrganizationDto>(organization);
        }

        public async Task<bool> UpdateOrganizationAsync(Guid id, UpdateOrganizationDto updateDto)
        {
            var organization = await _repository.GetByIdAsync(id);
            if (organization == null) return false;

            _mapper.Map(updateDto, organization);
            await _repository.UpdateAsync(organization);
            return true;
        }

        public async Task<bool> DeleteOrganizationAsync(Guid id)
        {
            var organization = await _repository.GetByIdAsync(id);
            if (organization == null) return false;

            await _repository.DeleteAsync(organization);
            return true;
        }
    }
}
