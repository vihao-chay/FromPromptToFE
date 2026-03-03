using System;

namespace FromFromptToFE.DTOs
{
    public class ProjectFilterDto
    {
        public string? Search { get; set; }
        public Guid? OrganizationId { get; set; }
        public string? ProjectType { get; set; }
        /// <summary>Sort field: Name, CreatedAt, ProjectType. Default CreatedAt.</summary>
        public string? SortBy { get; set; }
        /// <summary>asc | desc. Default desc.</summary>
        public string? SortOrder { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
