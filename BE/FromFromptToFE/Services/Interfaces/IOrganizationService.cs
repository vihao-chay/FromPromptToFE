using FromFromptToFE.Base;
using FromFromptToFE.DTOs;

namespace FromFromptToFE.Services
{
    public interface IOrganizationService
    {
        Task<PagingResult<OrganizationDto>> GetAllOrganizationsAsync(OrganizationFilterDto filter);
        Task<OrganizationDto?> GetOrganizationByIdAsync(Guid id);
        Task<OrganizationDto> CreateOrganizationAsync(CreateOrganizationDto createDto);
        Task<bool> UpdateOrganizationAsync(Guid id, UpdateOrganizationDto updateDto);
        Task<bool> DeleteOrganizationAsync(Guid id);
    }
}
