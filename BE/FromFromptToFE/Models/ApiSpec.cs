using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class ApiSpec
{
    public Guid Id { get; set; }

    public Guid ProjectInputId { get; set; }

    public string? SpecType { get; set; }

    public string? SpecContent { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ProjectInput ProjectInput { get; set; } = null!;
}
