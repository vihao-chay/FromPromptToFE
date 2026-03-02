using System;
using System.Threading.Tasks;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs.Page;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PageController : ControllerBase
    {
        private readonly IPageService _service;

        public PageController(IPageService service)
        {
            _service = service;
        }

        [HttpGet("output/{outputId}")]
        public async Task<IActionResult> GetPagesByOutputId(Guid outputId)
        {
            var pages = await _service.GetPagesByOutputIdAsync(outputId);
            return ResponseEntity<object>.Ok(pages, "Lấy danh sách UI màn hình thành công");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePageDto dto)
        {
            if (dto == null)
            {
                return ResponseEntity<PageDto>.Fail("Body không hợp lệ", 400);
            }
            var result = await _service.UpdatePageAsync(id, dto);
            if (result == null)
            {
                return ResponseEntity<PageDto>.Fail("Không tìm thấy page", 404);
            }
            return ResponseEntity<PageDto>.Ok(result, "Cập nhật page thành công");
        }
    }
}
