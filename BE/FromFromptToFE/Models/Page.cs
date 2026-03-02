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

    public DateTime? CreatedAt { get; set; }

    public virtual ProjectOutput ProjectOutput { get; set; } = null!;
}
