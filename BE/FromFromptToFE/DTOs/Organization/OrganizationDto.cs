using System;

namespace FromFromptToFE.DTOs
{
    public class OrganizationDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Plan { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
