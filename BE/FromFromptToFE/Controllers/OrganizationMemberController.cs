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
    [Route("api/organization-members")]
    public class OrganizationMemberController : ControllerBase
    {
        private readonly IOrganizationMemberService _service;

        public OrganizationMemberController(IOrganizationMemberService service)
        {
            _service = service;
        }

        [HttpGet("by-org/{organizationId}")]
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

        [HttpPost("invite")]
        public async Task<IActionResult> InviteMember([FromBody] InviteMemberDto inviteDto)
        {
            try
            {
                var result = await _service.InviteMemberAsync(inviteDto);
                return ResponseEntity<OrganizationMemberDto>.Ok(result, "Mời thành viên thành công");
            }
            catch (KeyNotFoundException ex)
            {
                return ResponseEntity<OrganizationMemberDto>.Fail(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return ResponseEntity<OrganizationMemberDto>.Fail(ex.Message);
            }
            catch (Exception ex)
            {
                return ResponseEntity<OrganizationMemberDto>.Fail($"Có lỗi xảy ra: {ex.Message}");
            }
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

        /// <summary>Chấp nhận lời mời tham gia tổ chức (từ link trong email). Token trong query.</summary>
        [HttpPost("join")]
        [AllowAnonymous]
        public async Task<IActionResult> JoinByToken([FromQuery] string token)
        {
            var ok = await _service.AcceptInviteByTokenAsync(token);
            if (!ok) return ResponseEntity<bool>.Fail("Link không hợp lệ hoặc đã được xử lý.");
            return ResponseEntity<bool>.Ok(true, "Bạn đã tham gia tổ chức thành công.");
        }

        /// <summary>Từ chối lời mời tham gia tổ chức (từ link trong email). Token trong query.</summary>
        [HttpPost("reject")]
        [AllowAnonymous]
        public async Task<IActionResult> RejectByToken([FromQuery] string token)
        {
            var ok = await _service.RejectInviteByTokenAsync(token);
            if (!ok) return ResponseEntity<bool>.Fail("Link không hợp lệ hoặc đã được xử lý.");
            return ResponseEntity<bool>.Ok(true, "Bạn đã từ chối lời mời.");
        }

        /// <summary>Get organizations for the current user (from JWT). Route userId is ignored; always uses DB for JWT user.</summary>
        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetMyOrganizations(Guid userId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var jwtUserId))
                return ResponseEntity<IEnumerable<UserOrganizationDto>>.Fail("Unauthorized", 401);
            var result = await _service.GetOrganizationsByUserIdAsync(jwtUserId);
            return ResponseEntity<IEnumerable<UserOrganizationDto>>.Ok(result, "Lấy danh sách tổ chức của người dùng thành công");
        }
    }
}
