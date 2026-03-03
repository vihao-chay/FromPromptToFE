using FromFromptToFE.Base;
using FromFromptToFE.DTOs.Admin;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IAdminService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<PagingResult<AdminUserDto>> GetUsersAsync(AdminUserFilterDto filter);
        Task<bool> ToggleUserStatusAsync(Guid userId);
        Task<PagingResult<AdminProjectDto>> GetProjectsAsync(AdminProjectFilterDto filter);
        Task<bool> DeleteProjectAsync(Guid projectId);
    }
}
