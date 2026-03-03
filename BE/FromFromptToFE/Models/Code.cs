using System;

namespace FromFromptToFE.Models;

/// <summary>
/// Entity for public.code table (Supabase) – metadata of code generation tasks.
/// </summary>
public class Code
{
    public Guid Id { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? RepoName { get; set; }
    public string? BranchName { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public Guid? UserId { get; set; }
    public string? PrLink { get; set; }
    public string? DownloadLink { get; set; }
    public string? ProjectName { get; set; }
}
