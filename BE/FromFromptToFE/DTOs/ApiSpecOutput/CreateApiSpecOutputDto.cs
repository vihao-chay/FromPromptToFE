using System;
using System.ComponentModel.DataAnnotations;

namespace FromFromptToFE.DTOs
{
    public class CreateApiSpecOutputDto
    {
        [Required(ErrorMessage = "ApiSpec ID là bắt buộc")]
        public Guid ApiSpecId { get; set; }

        [StringLength(50, ErrorMessage = "Version không được quá 50 ký tự")]
        public string? Version { get; set; }

        public string? Content { get; set; }
    }
}
