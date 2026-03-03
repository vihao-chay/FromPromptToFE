using System;

namespace FromFromptToFE.DTOs;

public class CodeFilterDto
{
    public string? Search { get; set; }
    public Guid? UserId { get; set; }
    public string? Status { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
