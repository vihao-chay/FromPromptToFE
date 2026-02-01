using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationMemberController : ControllerBase
    {
        private readonly IOrganizationMemberService _service;

        public OrganizationMemberController(IOrganizationMemberService service)
        {
            _service = service;
        }

        [HttpGet("org/{organizationId}")]
        public async Task<IActionResult> GetMembers(Guid organizationId, [FromQuery] MemberFilterDto filter)
        {
            var result = await _service.GetMembersByOrgIdAsync(organizationId, filter);
            return ResponseEntity<PagingResult<OrganizationMemberDto>>.Ok(result, "Lấy danh sách thành viên thành công");
        }

        [HttpPost]
        public async Task<IActionResult> AddMember([FromBody] AddMemberDto addDto)
        {
            var result = await _service.AddMemberAsync(addDto);
            return ResponseEntity<OrganizationMemberDto>.Ok(result, "Thêm thành viên thành công");
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateMemberRoleDto updateDto)
        {
            var result = await _service.UpdateMemberRoleAsync(id, updateDto);
            if (!result) return ResponseEntity<bool>.Fail("Không tìm thấy thành viên");
            return ResponseEntity<bool>.Ok(true, "Cập nhật vai trò thành công");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveMember(Guid id)
        {
            var result = await _service.RemoveMemberAsync(id);
            if (!result) return ResponseEntity<bool>.Fail("Không tìm thấy thành viên");
            return ResponseEntity<bool>.Ok(true, "Xóa thành viên khỏi tổ chức thành công");
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetMyOrganizations(Guid userId)
        {
            var result = await _service.GetOrganizationsByUserIdAsync(userId);
            return ResponseEntity<IEnumerable<UserOrganizationDto>>.Ok(result, "Lấy danh sách tổ chức của người dùng thành công");
        }
    }
}
