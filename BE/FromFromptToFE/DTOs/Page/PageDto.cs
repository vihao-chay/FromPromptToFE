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
