using System;
using System.Text.Json;

namespace FromFromptToFE.DTOs
{
    public class ProjectDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = null!;
        public string ProjectType { get; set; } = null!;
        public string? SystemPrompt { get; set; }
        public JsonElement? EntitySchema { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? RepoUrl { get; set; }
    }
}
