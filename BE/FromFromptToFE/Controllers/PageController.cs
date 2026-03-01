using System;
using System.Threading.Tasks;
using FromFromptToFE.Base;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
    }
}
