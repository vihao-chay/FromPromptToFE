using System.ComponentModel.DataAnnotations;

namespace FromFromptToFE.DTOs.GitHub
{
    public class PushToGitHubDto
    {
        [Required]
        public Guid ProjectId { get; set; }

        [Required]
        public string RepoName { get; set; } = null!;

        public string Branch { get; set; } = "main";

        public string CommitMessage { get; set; } = "Code push from AI Generator";
    }

    public class PushResultDto
    {
        public string RepoUrl { get; set; } = null!;
        public string Branch { get; set; } = null!;
        public int FilesCommitted { get; set; }
        public string OwnerLogin { get; set; } = null!;
    }
}
