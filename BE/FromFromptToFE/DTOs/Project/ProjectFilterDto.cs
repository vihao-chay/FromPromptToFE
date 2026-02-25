using System;

namespace FromFromptToFE.DTOs
{
    public class ProjectFilterDto
    {
        public string? Search { get; set; }
        public Guid? OrganizationId { get; set; }
        public string? ProjectType { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
