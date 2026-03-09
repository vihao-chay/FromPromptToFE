using System;
using System.Collections.Generic;

namespace FromFromptToFE.Models;

public partial class OrganizationMember
{
    public Guid Id { get; set; }

    public Guid OrganizationId { get; set; }

    public Guid UserId { get; set; }

    public string Role { get; set; } = null!;

    /// <summary>Invite = đang chờ; Joined = đã tham gia. Reject thì xóa record.</summary>
    public string? Status { get; set; }

    /// <summary>Token gửi trong link email Join/Reject. Null khi đã Joined.</summary>
    public string? InviteToken { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Organization Organization { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
