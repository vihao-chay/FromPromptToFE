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
    public class OrganizationController : ControllerBase
    {
        private readonly IOrganizationService _service;

        public OrganizationController(IOrganizationService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] OrganizationFilterDto filter)
        {
            var result = await _service.GetAllOrganizationsAsync(filter);
            return ResponseEntity<PagingResult<OrganizationDto>>.Ok(result, "Lấy danh sách tổ chức thành công");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var organization = await _service.GetOrganizationByIdAsync(id);
            if (organization == null)
            {
                return ResponseEntity<OrganizationDto>.Fail("Không tìm thấy tổ chức", 404);
            }
            return ResponseEntity<OrganizationDto>.Ok(organization, "Lấy thông tin tổ chức thành công");
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateOrganizationDto createDto)
        {
            var organization = await _service.CreateOrganizationAsync(createDto);
            return ResponseEntity<OrganizationDto>.Ok(organization, "Tạo tổ chức thành công");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateOrganizationDto updateDto)
        {
            var result = await _service.UpdateOrganizationAsync(id, updateDto);
            if (!result)
            {
                return ResponseEntity<bool>.Fail("Không tìm thấy tổ chức để cập nhật", 404);
            }
            return ResponseEntity<bool>.Ok(true, "Cập nhật tổ chức thành công");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteOrganizationAsync(id);
            if (!result)
            {
                return ResponseEntity<bool>.Fail("Không tìm thấy tổ chức để xóa", 404);
            }
            return ResponseEntity<bool>.Ok(true, "Xóa tổ chức thành công");
        }
    }
}
