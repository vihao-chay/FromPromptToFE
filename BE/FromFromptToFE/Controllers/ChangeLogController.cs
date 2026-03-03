using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChangeLogController : ControllerBase
    {
        private readonly IChangeLogService _service;

        public ChangeLogController(IChangeLogService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateChangeLogDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? actorId = string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var uid) ? null : uid;
            var result = await _service.CreateAsync(dto, actorId);
            return ResponseEntity<ChangeLogDto>.Ok(result, "Tạo change log thành công");
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ChangeLogFilterDto filter)
        {
            var result = await _service.GetPagedAsync(filter);
            return ResponseEntity<PagingResult<ChangeLogDto>>.Ok(result, "Lấy danh sách change log thành công");
        }
    }
}
