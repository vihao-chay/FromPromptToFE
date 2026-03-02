using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace FromFromptToFE.DTOs
{
    public class UpdateApiSpecDto
    {
        [StringLength(100, ErrorMessage = "Loại spec không được quá 100 ký tự")]
        public string? SpecType { get; set; }

        public JsonElement? SpecContent { get; set; }
    }
}
