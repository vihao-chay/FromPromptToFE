using FromFromptToFE.Base;
using FromFromptToFE.DTOs.Page;
using FromFromptToFE.DTOs.ProjectOutput;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectOutputController : ControllerBase
    {
        private readonly IProjectOutputService _service;

        public ProjectOutputController(IProjectOutputService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy danh sách output (phiên bản generate) theo project — search, sort, paging.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ProjectOutputFilterDto filter)
        {
            if (filter.ProjectId == Guid.Empty)
            {
                return ResponseEntity<PagingResult<ProjectOutputDto>>.Fail("projectId không hợp lệ", 400);
            }
            var result = await _service.GetPagedByProjectIdAsync(filter);
            return ResponseEntity<PagingResult<ProjectOutputDto>>.Ok(result, "Lấy danh sách output thành công");
        }

        /// <summary>
        /// Lấy chi tiết một output (kèm danh sách pages).
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return ResponseEntity<ProjectOutputDto>.Fail("Không tìm thấy output", 404);
            }
            return ResponseEntity<ProjectOutputDto>.Ok(result, "Lấy chi tiết output thành công");
        }

        /// <summary>
        /// Gọi AI (Gemini) sinh danh sách pages/code FE cho project. User thực hiện lấy từ JWT.
        /// </summary>
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateCode([FromQuery] Guid projectId)
        {
            if (projectId == Guid.Empty)
            {
                return ResponseEntity<ProjectOutputDto>.Fail("projectId không hợp lệ", 400);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return ResponseEntity<ProjectOutputDto>.Fail("Không xác định được người dùng", 401);
            }

            try
            {
                var result = await _service.GenerateCodeAsync(projectId, userId);
                return ResponseEntity<ProjectOutputDto>.Ok(result, "Sinh code thành công");
            }
            catch (Exception ex)
            {
                return ResponseEntity<ProjectOutputDto>.Fail(ex.Message, 500);
            }
        }

        /// <summary>
        /// Lưu kết quả generate (code, html, preview, task status, step output, tất cả prompt) vào project_outputs. Mỗi lần gọi tạo một bản ghi mới (version).
        /// </summary>
        [HttpPost("save")]
        public async Task<IActionResult> SaveOutput([FromQuery] Guid projectId, [FromBody] SaveProjectOutputDto dto)
        {
            if (projectId == Guid.Empty)
                return ResponseEntity<ProjectOutputDto>.Fail("projectId không hợp lệ", 400);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return ResponseEntity<ProjectOutputDto>.Fail("Không xác định được người dùng", 401);

            try
            {
                var result = await _service.SaveOutputAsync(projectId, userId, dto ?? new SaveProjectOutputDto());
                return ResponseEntity<ProjectOutputDto>.Ok(result, "Lưu output thành công");
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                if (ex.InnerException != null)
                    message += " | " + ex.InnerException.Message;
                return ResponseEntity<ProjectOutputDto>.Fail(message, ex.Message == "Project not found" ? 404 : 500);
            }
        }

        /// <summary>
        /// FE gửi danh sách pages (sau khi gọi Gemini) để lưu vào output.
        /// </summary>
        [HttpPost("{outputId}/pages")]
        public async Task<IActionResult> AddPages(Guid outputId, [FromBody] List<CreatePageDto> pages)
        {
            if (outputId == Guid.Empty)
            {
                return ResponseEntity<ProjectOutputDto>.Fail("outputId không hợp lệ", 400);
            }

            try
            {
                var result = await _service.AddPagesToOutputAsync(outputId, pages ?? new List<CreatePageDto>());
                return ResponseEntity<ProjectOutputDto>.Ok(result, "Thêm pages thành công");
            }
            catch (Exception ex)
            {
                return ResponseEntity<ProjectOutputDto>.Fail(ex.Message, ex.Message == "Project output not found" ? 404 : 500);
            }
        }
    }
}
