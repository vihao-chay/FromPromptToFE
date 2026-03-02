using FromFromptToFE.Base;
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
        /// Lấy danh sách output (phiên bản generate) theo project.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllByProjectId([FromQuery] Guid projectId)
        {
            if (projectId == Guid.Empty)
            {
                return ResponseEntity<IEnumerable<ProjectOutputDto>>.Fail("projectId không hợp lệ", 400);
            }
            var result = await _service.GetAllByProjectIdAsync(projectId);
            return ResponseEntity<IEnumerable<ProjectOutputDto>>.Ok(result, "Lấy danh sách output thành công");
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
    }
}
