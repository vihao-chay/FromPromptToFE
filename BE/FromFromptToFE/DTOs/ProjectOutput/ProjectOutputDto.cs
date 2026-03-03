using System;
using System.Collections.Generic;
using FromFromptToFE.DTOs.Page;

namespace FromFromptToFE.DTOs.ProjectOutput
{
    public class ProjectOutputFilterDto
    {
        public Guid ProjectId { get; set; }
        public string? Search { get; set; }
        public string? Status { get; set; }
        /// <summary>Sort field: Version, Status, CreatedAt. Default CreatedAt.</summary>
        public string? SortBy { get; set; }
        /// <summary>asc | desc. Default desc.</summary>
        public string? SortOrder { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class ProjectOutputDto
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string? Version { get; set; }
        public string? Status { get; set; }
        public Guid? TriggeredBy { get; set; }
        public DateTime? CreatedAt { get; set; }

        public IEnumerable<PageDto> Pages { get; set; } = new List<PageDto>();
    }
}
