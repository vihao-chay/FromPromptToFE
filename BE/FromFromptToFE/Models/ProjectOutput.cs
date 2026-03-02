using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class ProjectOutput
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public string? Version { get; set; }

    public string? Status { get; set; }

    public Guid? TriggeredBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Page> Pages { get; set; } = new List<Page>();

    public virtual Project Project { get; set; } = null!;

    public virtual User? TriggeredByNavigation { get; set; }
}
