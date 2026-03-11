using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = null!;

    public string? Name { get; set; }

    public string? PasswordHash { get; set; }

    public bool? IsVerified { get; set; }

    public string? VerifyToken { get; set; }

    public string? GoogleId { get; set; }

    public string? GitHubId { get; set; }

    public string? GitHubAccessToken { get; set; }

    public string? AvatarUrl { get; set; }

    public string Provider { get; set; } = null!;

    public string? ResetToken { get; set; }

    public DateTime? ResetTokenExpires { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpires { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool IsAdmin { get; set; }

    /// <summary>true = tài khoản bình thường, false = bị ban (không được đăng nhập)</summary>
    public bool IsActive { get; set; }

    public virtual ICollection<ChangeLog> ChangeLogs { get; set; } = new List<ChangeLog>();

    public virtual ICollection<OrganizationMember> OrganizationMembers { get; set; } = new List<OrganizationMember>();

    public virtual ICollection<ProjectOutput> ProjectOutputs { get; set; } = new List<ProjectOutput>();
}
