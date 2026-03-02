using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class ApiSpecOutput
{
    public Guid Id { get; set; }

    public Guid ApiSpecId { get; set; }

    public string? Version { get; set; }

    public string? Content { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ApiSpec ApiSpec { get; set; } = null!;
}
