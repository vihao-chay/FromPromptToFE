using FromFromptToFE.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace FromFromptToFE.DTOs
{
    public class InviteMemberDto
    {
        [Required(ErrorMessage = "ID tổ chức là bắt buộc")]
        public Guid OrganizationId { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Vai trò là bắt buộc")]
        public OrganizationRole Role { get; set; } = OrganizationRole.Developer;
    }
}
