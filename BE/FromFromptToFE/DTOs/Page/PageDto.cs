using System;

namespace FromFromptToFE.DTOs.Page
{
    public class PageDto
    {
        public Guid Id { get; set; }
        public Guid ProjectOutputId { get; set; }
        public string? Route { get; set; }
        public string? PageType { get; set; }
        public string? EntityName { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
