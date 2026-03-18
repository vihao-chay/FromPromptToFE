using System.Security.Claims;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Services;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/projects")]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _service;
        private readonly IOrganizationMemberService _memberService;

        public ProjectController(IProjectService service, IOrganizationMemberService memberService)
        {
            _service = service;
            _memberService = memberService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ProjectFilterDto filter)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return ResponseEntity<PagingResult<ProjectDto>>.Fail("Unauthorized", 401);

            var myOrgs = await _memberService.GetOrganizationsByUserIdAsync(userId);
            var allowedOrgIds = myOrgs.Select(o => o.OrganizationId).ToHashSet();

            if (filter.OrganizationId.HasValue && !allowedOrgIds.Contains(filter.OrganizationId.Value))
                return ResponseEntity<PagingResult<ProjectDto>>.Ok(new PagingResult<ProjectDto>(), "OK");

            var result = await _service.GetAllProjectsAsync(filter);
            return ResponseEntity<PagingResult<ProjectDto>>.Ok(result, "OK");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var project = await _service.GetProjectByIdAsync(id);
            if (project == null)
            {
                return ResponseEntity<ProjectDto>.Fail("Không tìm thấy dự án", 404);
            }
            return ResponseEntity<ProjectDto>.Ok(project, "Lấy thông tin dự án thành công");
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto createDto)
        {
            if (createDto == null)
                return ResponseEntity<ProjectDto>.Fail("Request body required", 400);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return ResponseEntity<ProjectDto>.Fail("Unauthorized", 401);

            var myOrgs = await _memberService.GetOrganizationsByUserIdAsync(userId);
            if (!myOrgs.Any(o => o.OrganizationId == createDto.OrganizationId))
                return ResponseEntity<ProjectDto>.Fail("Organization not found or access denied", 403);

            var project = await _service.CreateProjectAsync(createDto);
            return ResponseEntity<ProjectDto>.Ok(project, "OK");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto updateDto)
        {
            if (updateDto == null)
                return ResponseEntity<bool>.Fail("Request body required", 400);

            var result = await _service.UpdateProjectAsync(id, updateDto);
            if (!result)
            {
                return ResponseEntity<bool>.Fail("Không tìm thấy dự án để cập nhật", 404);
            }
            return ResponseEntity<bool>.Ok(true, "Cập nhật dự án thành công");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteProjectAsync(id);
            if (!result)
            {
                return ResponseEntity<bool>.Fail("Không tìm thấy dự án để xóa", 404);
            }
            return ResponseEntity<bool>.Ok(true, "Xóa dự án thành công");
        }
    }
}
