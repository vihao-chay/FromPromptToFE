using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/api-spec-outputs")]
    public class ApiSpecOutputController : ControllerBase
    {
        private readonly IApiSpecOutputService _service;

        public ApiSpecOutputController(IApiSpecOutputService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ApiSpecOutputFilterDto filter)
        {
            var result = await _service.GetAllApiSpecOutputsAsync(filter);
            return ResponseEntity<PagingResult<ApiSpecOutputDto>>.Ok(result, "Lấy danh sách API Spec Output thành công");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var apiSpecOutput = await _service.GetApiSpecOutputByIdAsync(id);
            if (apiSpecOutput == null)
            {
                return ResponseEntity<ApiSpecOutputDto>.Fail("Không tìm thấy API Spec Output", 404);
            }
            return ResponseEntity<ApiSpecOutputDto>.Ok(apiSpecOutput, "Lấy thông tin API Spec Output thành công");
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateApiSpecOutputDto createDto)
        {
            var apiSpecOutput = await _service.CreateApiSpecOutputAsync(createDto);
            return ResponseEntity<ApiSpecOutputDto>.Ok(apiSpecOutput, "Tạo API Spec Output thành công");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateApiSpecOutputDto updateDto)
        {
            var result = await _service.UpdateApiSpecOutputAsync(id, updateDto);
            if (!result)
            {
                return ResponseEntity<bool>.Fail("Không tìm thấy API Spec Output để cập nhật", 404);
            }
            return ResponseEntity<bool>.Ok(true, "Cập nhật API Spec Output thành công");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteApiSpecOutputAsync(id);
            if (!result)
            {
                return ResponseEntity<bool>.Fail("Không tìm thấy API Spec Output để xóa", 404);
            }
            return ResponseEntity<bool>.Ok(true, "Xóa API Spec Output thành công");
        }
    }
}
