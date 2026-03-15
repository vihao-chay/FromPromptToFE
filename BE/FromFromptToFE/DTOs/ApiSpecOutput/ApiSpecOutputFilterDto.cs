using System;

namespace FromFromptToFE.DTOs
{
    public class ApiSpecOutputFilterDto
    {
        public string? Search { get; set; }
        public Guid? ApiSpecId { get; set; }
        public string? Version { get; set; }
        /// <summary>Sort field: Version, CreatedAt. Default CreatedAt.</summary>
        public string? SortBy { get; set; }
        /// <summary>asc | desc. Default desc.</summary>
        public string? SortOrder { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
