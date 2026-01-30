using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class Organization
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Plan { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<ChangeLog> ChangeLogs { get; set; } = new List<ChangeLog>();

    public virtual ICollection<OrganizationMember> OrganizationMembers { get; set; } = new List<OrganizationMember>();

    public virtual ICollection<ProjectInput> ProjectInputs { get; set; } = new List<ProjectInput>();
}
