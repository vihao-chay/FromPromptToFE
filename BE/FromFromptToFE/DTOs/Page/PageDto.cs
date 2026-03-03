using System;

namespace FromFromptToFE.DTOs.Page
{
    public class PageFilterDto
    {
        public Guid OutputId { get; set; }
        public string? Search { get; set; }
        public string? PageType { get; set; }
        public string? EntityName { get; set; }
        /// <summary>Sort field: Route, PageType, EntityName, CreatedAt. Default CreatedAt.</summary>
        public string? SortBy { get; set; }
        /// <summary>asc | desc. Default asc.</summary>
        public string? SortOrder { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class PageDto
    {
        public Guid Id { get; set; }
        public Guid ProjectOutputId { get; set; }
        public string? Route { get; set; }
        public string? PageType { get; set; }
        public string? EntityName { get; set; }
        public string? GeneratedCode { get; set; }
        public string? FileName { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    /// <summary>DTO để FE gửi lên khi thêm pages (sau khi gọi Gemini).</summary>
    public class CreatePageDto
    {
        public string? Route { get; set; }
        public string? PageType { get; set; }
        public string? EntityName { get; set; }
        public string? GeneratedCode { get; set; }
        public string? FileName { get; set; }
    }

    /// <summary>DTO để cập nhật một page (sửa code, route, ...).</summary>
    public class UpdatePageDto
    {
        public string? Route { get; set; }
        public string? PageType { get; set; }
        public string? EntityName { get; set; }
        public string? GeneratedCode { get; set; }
        public string? FileName { get; set; }
    }
}
