using FromFromptToFE.Enums;
using System;

namespace FromFromptToFE.DTOs
{
    public class OrganizationMemberDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string? UserAvatar { get; set; }
        public OrganizationRole Role { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
