using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class ApiSpec
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public string? SpecType { get; set; }

    public string? SpecContent { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<ApiSpecOutput> ApiSpecOutputs { get; set; } = new List<ApiSpecOutput>();

    public virtual Project Project { get; set; } = null!;
}
