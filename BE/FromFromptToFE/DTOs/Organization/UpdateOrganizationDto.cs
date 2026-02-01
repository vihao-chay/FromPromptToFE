using System.ComponentModel.DataAnnotations;

namespace FromFromptToFE.DTOs
{
    public class UpdateOrganizationDto
    {
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Tên tổ chức phải từ 3 đến 100 ký tự")]
        public string? Name { get; set; }

        [StringLength(50, ErrorMessage = "Gói dịch vụ không được quá 50 ký tự")]
        public string? Plan { get; set; }
    }
}
