using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class Project
{
    public Guid Id { get; set; }

    public Guid OrganizationId { get; set; }

    public string Name { get; set; } = null!;

    public string ProjectType { get; set; } = null!;

    public string? SystemPrompt { get; set; }

    public string? EntitySchema { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? RepoUrl { get; set; }

    public virtual ICollection<ApiSpec> ApiSpecs { get; set; } = new List<ApiSpec>();

    public virtual Organization Organization { get; set; } = null!;

    public virtual ICollection<ProjectOutput> ProjectOutputs { get; set; } = new List<ProjectOutput>();
}
