using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace FromFromptToFE.DTOs
{
    public class UpdateProjectDto
    {
        [StringLength(200, MinimumLength = 3, ErrorMessage = "Tên dự án phải từ 3 đến 200 ký tự")]
        public string? Name { get; set; }

        [StringLength(50, ErrorMessage = "Loại dự án không được quá 50 ký tự")]
        public string? ProjectType { get; set; }

        public string? SystemPrompt { get; set; }

        public JsonElement? EntitySchema { get; set; }

        [Url(ErrorMessage = "URL repository không hợp lệ")]
        public string? RepoUrl { get; set; }
    }
}
