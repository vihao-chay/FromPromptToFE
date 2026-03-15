using System.ComponentModel.DataAnnotations;

namespace FromFromptToFE.DTOs
{
    public class UpdateApiSpecOutputDto
    {
        [StringLength(50, ErrorMessage = "Version không được quá 50 ký tự")]
        public string? Version { get; set; }

        public string? Content { get; set; }
    }
}
