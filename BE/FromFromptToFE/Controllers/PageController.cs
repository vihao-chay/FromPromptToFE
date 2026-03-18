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
    [Route("api/pages")]
    public class PageController : ControllerBase
    {
        private readonly IPageService _service;

        public PageController(IPageService service)
        {
            _service = service;
        }

        /// <summary>Lấy danh sách pages theo output — search, sort, paging. Dùng query PageFilterDto (outputId, search, pageType, entityName, sortBy, sortOrder, pageIndex, pageSize).</summary>
        [HttpGet("output")]
        public async Task<IActionResult> GetPagedByOutputId([FromQuery] PageFilterDto filter)
        {
            if (filter.OutputId == Guid.Empty)
            {
                return ResponseEntity<object>.Fail("outputId không hợp lệ", 400);
            }
            var result = await _service.GetPagedByOutputIdAsync(filter);
            return ResponseEntity<object>.Ok(result, "Lấy danh sách UI màn hình thành công");
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
