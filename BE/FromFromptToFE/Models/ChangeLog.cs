using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class ChangeLog
{
    public Guid Id { get; set; }

    public Guid? OrganizationId { get; set; }

    public Guid? ActorId { get; set; }

    public string? EntityType { get; set; }

    public Guid? EntityId { get; set; }

    public string? Action { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? Actor { get; set; }

    public virtual Organization? Organization { get; set; }
}
