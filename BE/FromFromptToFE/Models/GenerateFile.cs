using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class GenerateFile
{
    public Guid Id { get; set; }

    public Guid GenerateTaskId { get; set; }

    public Guid RepositoryId { get; set; }

    public Guid? PageId { get; set; }

    public string? FilePath { get; set; }

    public string? ContentHash { get; set; }

    public string? Language { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual GenerateTask GenerateTask { get; set; } = null!;

    public virtual Page? Page { get; set; }

    public virtual Repository Repository { get; set; } = null!;
}
