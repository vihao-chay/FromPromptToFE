using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class ProjectOutput
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public string? Version { get; set; }

    /// <summary>Task status when generating code (e.g. Pending, Running, Success, Failed).</summary>
    public string? Status { get; set; }

    public Guid? TriggeredBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? SystemPrompt { get; set; }

    public string? UserPrompt { get; set; }

    /// <summary>All prompts for this generation (JSON array of { role, content } or similar).</summary>
    public string? PromptHistory { get; set; }

    public string? GeneratedTsx { get; set; }

    public string? GeneratedHtml { get; set; }

    /// <summary>Step-by-step output when generating code (JSON).</summary>
    public string? StepOutput { get; set; }

    public string? GeneratedPreviewImage { get; set; }

    public virtual ICollection<Page> Pages { get; set; } = new List<Page>();

    public virtual Project Project { get; set; } = null!;

    public virtual User? TriggeredByNavigation { get; set; }
}
