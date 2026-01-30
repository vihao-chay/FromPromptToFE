using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class Repository
{
    public Guid Id { get; set; }

    public Guid ProjectInputId { get; set; }

    public string? Name { get; set; }

    public string? GitUrl { get; set; }

    public string? FrontendFramework { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<GenerateFile> GenerateFiles { get; set; } = new List<GenerateFile>();

    public virtual ICollection<Page> Pages { get; set; } = new List<Page>();

    public virtual ProjectInput ProjectInput { get; set; } = null!;
}
