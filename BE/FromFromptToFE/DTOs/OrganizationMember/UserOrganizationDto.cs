using FromFromptToFE.Enums;
using System;

namespace FromFromptToFE.DTOs
{
    public class UserOrganizationDto
    {
        public Guid OrganizationId { get; set; }
        public string OrganizationName { get; set; } = null!;
        public string? OrganizationPlan { get; set; }
        public DateTime? JoinedAt { get; set; }
    }
}
