using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using System;

namespace FromFromptToFE.Services
{
    public interface IOrganizationService
    {
        Task<PagingResult<OrganizationDto>> GetAllOrganizationsAsync(OrganizationFilterDto filter);
        Task<PagingResult<OrganizationDto>> GetOrganizationsByUserAsync(Guid userId, OrganizationFilterDto filter);
        Task<OrganizationDto?> GetOrganizationByIdAsync(Guid id);
        Task<OrganizationDto> CreateOrganizationAsync(CreateOrganizationDto createDto);
        Task<bool> UpdateOrganizationAsync(Guid id, UpdateOrganizationDto updateDto);
        Task<bool> DeleteOrganizationAsync(Guid id);
    }
}
