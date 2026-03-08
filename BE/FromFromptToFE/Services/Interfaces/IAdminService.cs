using FromFromptToFE.Base;
using FromFromptToFE.DTOs.Admin;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IAdminService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<PagingResult<AdminUserDto>> GetUsersAsync(AdminUserFilterDto filter);
        Task<AdminUserDto> CreateUserAsync(CreateAdminUserDto dto);
        Task<AdminUserDto?> UpdateUserAsync(Guid userId, UpdateAdminUserDto dto);
        Task<bool> DeleteUserAsync(Guid userId);
        Task<bool> DeleteUsersBulkAsync(List<Guid> userIds);
        Task<bool> ToggleUserStatusAsync(Guid userId);
        Task<PagingResult<AdminProjectDto>> GetProjectsAsync(AdminProjectFilterDto filter);
        Task<bool> DeleteProjectAsync(Guid projectId);
        Task<bool> DeleteProjectsBulkAsync(List<Guid> projectIds);
        Task<AdminProjectPreviewDto?> GetProjectPreviewAsync(Guid projectId);
    }
}
