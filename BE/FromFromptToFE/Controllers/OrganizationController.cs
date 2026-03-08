using System.Security.Claims;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Enums;
using FromFromptToFE.Services;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationController : ControllerBase
    {
        private readonly IOrganizationService _service;
        private readonly IOrganizationMemberService _memberService;

        public OrganizationController(IOrganizationService service, IOrganizationMemberService memberService)
        {
            _service = service;
            _memberService = memberService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] OrganizationFilterDto filter)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return ResponseEntity<PagingResult<OrganizationDto>>.Fail("Unauthorized", 401);

            var result = await _service.GetOrganizationsByUserAsync(userId, filter);
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
        public async Task<IActionResult> Create([FromBody] CreateOrganizationDto createDto)
        {
            if (createDto == null)
                return ResponseEntity<OrganizationDto>.Fail("Request body is required", 400);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return ResponseEntity<OrganizationDto>.Fail("Unauthorized", 401);

            var organization = await _service.CreateOrganizationAsync(createDto);
            await _memberService.AddMemberAsync(new AddMemberDto
            {
                OrganizationId = organization.Id,
                UserId = userId,
                Role = OrganizationRole.Owner
            });
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
