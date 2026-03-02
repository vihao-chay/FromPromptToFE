using System;
using System.Text.Json;

namespace FromFromptToFE.DTOs
{
    public class ApiSpecDto
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string? SpecType { get; set; }
        public JsonElement? SpecContent { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
