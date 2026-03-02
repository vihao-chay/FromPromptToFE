using System;

namespace FromFromptToFE.DTOs
{
    public class ApiSpecFilterDto
    {
        public string? Search { get; set; }
        public Guid? ProjectId { get; set; }
        public string? SpecType { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
