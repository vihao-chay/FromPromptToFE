using FromFromptToFE.Enums;
using System.ComponentModel.DataAnnotations;

namespace FromFromptToFE.DTOs
{
    public class UpdateMemberRoleDto
    {
        [Required(ErrorMessage = "Vai trò là bắt buộc")]
        public OrganizationRole Role { get; set; }
    }
}
