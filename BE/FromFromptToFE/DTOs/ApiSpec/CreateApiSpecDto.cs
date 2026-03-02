using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace FromFromptToFE.DTOs
{
    public class CreateApiSpecDto
    {
        [Required(ErrorMessage = "Project ID là bắt buộc")]
        public Guid ProjectId { get; set; }

        [StringLength(100, ErrorMessage = "Loại spec không được quá 100 ký tự")]
        public string? SpecType { get; set; }

        public JsonElement? SpecContent { get; set; }
    }
}
