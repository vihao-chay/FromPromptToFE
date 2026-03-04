using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _service;

        public ProjectController(IProjectService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ProjectFilterDto filter)
        {
            var result = await _service.GetAllProjectsAsync(filter);
            return ResponseEntity<PagingResult<ProjectDto>>.Ok(result, "Lấy danh sách dự án thành công");
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
        public async Task<IActionResult> Create(CreateProjectDto createDto)
        {
            var project = await _service.CreateProjectAsync(createDto);
            return ResponseEntity<ProjectDto>.Ok(project, "Tạo dự án thành công");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateProjectDto updateDto)
        {
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
