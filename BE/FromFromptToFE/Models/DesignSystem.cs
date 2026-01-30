using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class DesignSystem
{
    public Guid Id { get; set; }

    public Guid ProjectInputId { get; set; }

    public string? Name { get; set; }

    public string? Config { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ProjectInput ProjectInput { get; set; } = null!;
}
