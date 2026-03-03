using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;

namespace FromFromptToFE.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IOrganizationRepository _repository;
        private readonly IMapper _mapper;

        public OrganizationService(IOrganizationRepository repository, IMapper mapper)
        {
            _repository = repository;
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
