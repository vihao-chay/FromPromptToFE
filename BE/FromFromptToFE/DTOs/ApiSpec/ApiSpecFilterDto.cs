using System;

namespace FromFromptToFE.DTOs
{
    public class ApiSpecFilterDto
    {
        public string? Search { get; set; }
        public Guid? ProjectId { get; set; }
        public string? SpecType { get; set; }
        /// <summary>Sort field: SpecType, CreatedAt. Default CreatedAt.</summary>
        public string? SortBy { get; set; }
        /// <summary>asc | desc. Default desc.</summary>
        public string? SortOrder { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
