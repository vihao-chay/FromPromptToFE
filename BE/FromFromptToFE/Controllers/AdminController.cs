using FromFromptToFE.Base;
using FromFromptToFE.DTOs.Admin;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        /// <summary>
        /// GET /api/admin/stats — System statistics overview
        /// </summary>
        [HttpGet("stats")]
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
        /// POST /api/admin/users — Create user
        /// </summary>
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateAdminUserDto dto)
        {
            try
            {
                var result = await _adminService.CreateUserAsync(dto);
                // Return Status201Created using ControllerBase's StatusCode optionally, but for consistency using ResponseEntity:
                return StatusCode(201, ResponseEntity<AdminUserDto>.Ok(result, "User created successfully"));
            }
            catch (Exception ex)
            {
                return ResponseEntity<AdminUserDto>.Fail($"Error creating user: {ex.Message}", 400);
            }
        }

        /// <summary>
        /// PUT /api/admin/users/{id} — Update user
        /// </summary>
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateAdminUserDto dto)
        {
            try
            {
                var result = await _adminService.UpdateUserAsync(id, dto);
                if (result == null) return ResponseEntity<AdminUserDto>.Fail("User not found", 404);
                return ResponseEntity<AdminUserDto>.Ok(result, "User updated successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<AdminUserDto>.Fail($"Error updating user: {ex.Message}", 400);
            }
        }

        /// <summary>
        /// DELETE /api/admin/users/{id} — Delete user
        /// </summary>
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                var result = await _adminService.DeleteUserAsync(id);
                if (!result) return ResponseEntity<bool>.Fail("User not found", 404);
                return ResponseEntity<bool>.Ok(true, "User deleted successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<bool>.Fail($"Error deleting user: {ex.Message}", 400);
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
        /// DELETE /api/admin/projects/{id} — Delete a project and its related data
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

        [HttpDelete("users/bulk")]
        public async Task<IActionResult> DeleteUsersBulk([FromBody] BulkDeleteDto dto)
        {
            try
            {
                var result = await _adminService.DeleteUsersBulkAsync(dto.Ids);
                return ResponseEntity<bool>.Ok(true, "Users deleted successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<bool>.Fail($"Error deleting users: {ex.Message}", 500);
            }
        }

        [HttpDelete("projects/bulk")]
        public async Task<IActionResult> DeleteProjectsBulk([FromBody] BulkDeleteDto dto)
        {
            try
            {
                var result = await _adminService.DeleteProjectsBulkAsync(dto.Ids);
                return ResponseEntity<bool>.Ok(true, "Projects deleted successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<bool>.Fail($"Error deleting projects: {ex.Message}", 500);
            }
        }

        [HttpGet("projects/{id}/preview")]
        public async Task<IActionResult> GetProjectPreview(Guid id)
        {
            try
            {
                var result = await _adminService.GetProjectPreviewAsync(id);
                if (result == null) return ResponseEntity<AdminProjectPreviewDto>.Fail("Project not found or no preview available", 404);
                return ResponseEntity<AdminProjectPreviewDto>.Ok(result, "Project preview retrieved successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<AdminProjectPreviewDto>.Fail($"Error retrieving project preview: {ex.Message}", 500);
            }
        }
    }
}
