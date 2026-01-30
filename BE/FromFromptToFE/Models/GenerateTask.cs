using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class GenerateTask
{
    public Guid Id { get; set; }

    public Guid ProjectOutputId { get; set; }

    public string? TaskType { get; set; }

    public string? Status { get; set; }

    public string? ValidationResult { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<GenerateFile> GenerateFiles { get; set; } = new List<GenerateFile>();

    public virtual ProjectOutput ProjectOutput { get; set; } = null!;
}
