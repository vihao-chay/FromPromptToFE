using System;

namespace FromFromptToFE.DTOs
{
    public class ChangeLogFilterDto
    {
        public string? Search { get; set; }
        public Guid? EntityId { get; set; }
        public Guid? OrganizationId { get; set; }
        public string? EntityType { get; set; }
        public string? Action { get; set; }
        /// <summary>Sort field: CreatedAt, Action, EntityType. Default CreatedAt.</summary>
        public string? SortBy { get; set; }
        /// <summary>asc | desc. Default desc.</summary>
        public string? SortOrder { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }
}
