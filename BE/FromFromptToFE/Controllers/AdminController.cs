using FromFromptToFE.Base;
using FromFromptToFE.DTOs.Admin;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        /// <summary>
        /// GET /admin/dashboard — System statistics overview
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _adminService.GetDashboardStatsAsync();
                return ResponseEntity<DashboardStatsDto>.Ok(stats, "Dashboard stats retrieved successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<DashboardStatsDto>.Fail($"Error retrieving dashboard stats: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// GET /admin/users — Paginated user list with search
        /// </summary>
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] AdminUserFilterDto filter)
        {
            try
            {
                var result = await _adminService.GetUsersAsync(filter);
                return ResponseEntity<PagingResult<AdminUserDto>>.Ok(result, "User list retrieved successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<PagingResult<AdminUserDto>>.Fail($"Error retrieving users: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// PUT /admin/users/{id}/toggle-status — Toggle user active/inactive
        /// </summary>
        [HttpPut("users/{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(Guid id)
        {
            try
            {
                var result = await _adminService.ToggleUserStatusAsync(id);
                if (!result)
                {
                    return ResponseEntity<bool>.Fail("User not found", 404);
                }
                return ResponseEntity<bool>.Ok(true, "User status toggled successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<bool>.Fail($"Error toggling user status: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// GET /admin/projects — Paginated project list with search
        /// </summary>
        [HttpGet("projects")]
        public async Task<IActionResult> GetProjects([FromQuery] AdminProjectFilterDto filter)
        {
            try
            {
                var result = await _adminService.GetProjectsAsync(filter);
                return ResponseEntity<PagingResult<AdminProjectDto>>.Ok(result, "Project list retrieved successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<PagingResult<AdminProjectDto>>.Fail($"Error retrieving projects: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// DELETE /admin/projects/{id} — Delete a project and its related data
        /// </summary>
        [HttpDelete("projects/{id}")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            try
            {
                var result = await _adminService.DeleteProjectAsync(id);
                if (!result)
                {
                    return ResponseEntity<bool>.Fail("Project not found", 404);
                }
                return ResponseEntity<bool>.Ok(true, "Project deleted successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<bool>.Fail($"Error deleting project: {ex.Message}", 500);
            }
        }
    }
}
