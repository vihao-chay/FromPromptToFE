using FromFromptToFE.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace FromFromptToFE.DTOs
{
    public class AddMemberDto
    {
        [Required(ErrorMessage = "ID tổ chức là bắt buộc")]
        public Guid OrganizationId { get; set; }

        [Required(ErrorMessage = "ID người dùng là bắt buộc")]
        public Guid UserId { get; set; }

        [Required(ErrorMessage = "Vai trò là bắt buộc")]
        public OrganizationRole Role { get; set; } = OrganizationRole.Member;
    }
}
