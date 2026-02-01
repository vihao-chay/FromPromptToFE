using System;

namespace FromFromptToFE.DTOs
{
    public class OrganizationFilterDto
    {
        public string? Search { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
