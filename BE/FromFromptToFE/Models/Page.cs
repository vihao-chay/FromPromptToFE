using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class Page
{
    public Guid Id { get; set; }

    public Guid ProjectOutputId { get; set; }

    public string? Route { get; set; }

    public string? PageType { get; set; }

    public string? EntityName { get; set; }

    public Guid? RepositoryId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<GenerateFile> GenerateFiles { get; set; } = new List<GenerateFile>();

    public virtual ProjectOutput ProjectOutput { get; set; } = null!;

    public virtual Repository? Repository { get; set; }
}
