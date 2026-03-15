using System;

namespace FromFromptToFE.DTOs
{
    public class ApiSpecOutputDto
    {
        public Guid Id { get; set; }
        public Guid ApiSpecId { get; set; }
        public string? Version { get; set; }
        public string? Content { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
