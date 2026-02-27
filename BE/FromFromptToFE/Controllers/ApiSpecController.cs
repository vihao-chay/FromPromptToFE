using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Services;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApiSpecController : ControllerBase
    {
        private readonly IApiSpecService _service;

        public ApiSpecController(IApiSpecService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ApiSpecFilterDto filter)
        {
            var result = await _service.GetAllApiSpecsAsync(filter);
            return ResponseEntity<PagingResult<ApiSpecDto>>.Ok(result, "Lấy danh sách API Spec thành công");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var apiSpec = await _service.GetApiSpecByIdAsync(id);
            if (apiSpec == null)
            {
                return ResponseEntity<ApiSpecDto>.Fail("Không tìm thấy API Spec", 404);
            }
            return ResponseEntity<ApiSpecDto>.Ok(apiSpec, "Lấy thông tin API Spec thành công");
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateApiSpecDto createDto)
        {
            var apiSpec = await _service.CreateApiSpecAsync(createDto);
            return ResponseEntity<ApiSpecDto>.Ok(apiSpec, "Tạo API Spec thành công");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateApiSpecDto updateDto)
        {
            var result = await _service.UpdateApiSpecAsync(id, updateDto);
            if (!result)
            {
                return ResponseEntity<bool>.Fail("Không tìm thấy API Spec để cập nhật", 404);
            }
            return ResponseEntity<bool>.Ok(true, "Cập nhật API Spec thành công");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteApiSpecAsync(id);
            if (!result)
            {
                return ResponseEntity<bool>.Fail("Không tìm thấy API Spec để xóa", 404);
            }
            return ResponseEntity<bool>.Ok(true, "Xóa API Spec thành công");
        }
    }
}
