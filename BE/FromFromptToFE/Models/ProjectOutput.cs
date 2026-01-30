using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class ProjectOutput
{
    public Guid Id { get; set; }

    public Guid ProjectInputId { get; set; }

    public string? Version { get; set; }

    public string? Status { get; set; }

    public Guid? TriggeredBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<GenerateTask> GenerateTasks { get; set; } = new List<GenerateTask>();

    public virtual ICollection<Page> Pages { get; set; } = new List<Page>();

    public virtual ProjectInput ProjectInput { get; set; } = null!;

    public virtual User? TriggeredByNavigation { get; set; }
}
