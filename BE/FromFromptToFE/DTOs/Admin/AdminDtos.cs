namespace FromFromptToFE.DTOs.Admin
{
    // GET /admin/dashboard
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalOrganizations { get; set; }
        public int TotalProjects { get; set; }
        public int TotalAIGenerations { get; set; }
        public int VerifiedUsers { get; set; }
        public int UnverifiedUsers { get; set; }
    }

    // GET /admin/users
    public class AdminUserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string? Name { get; set; }
        public string? AvatarUrl { get; set; }
        public string Provider { get; set; } = null!;
        public bool IsVerified { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // GET /admin/projects
    public class AdminProjectDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string ProjectType { get; set; } = null!;
        public Guid OrganizationId { get; set; }
        public string? OrganizationName { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool HasGeneratedCode { get; set; }
    }

    // Query params for user list
    public class AdminUserFilterDto
    {
        public string? Search { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    // Query params for project list
    public class AdminProjectFilterDto
    {
        public string? Search { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
