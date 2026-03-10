using System;

namespace FromFromptToFE.DTOs
{
    public class ChangeLogDto
    {
        public Guid Id { get; set; }
        public Guid? OrganizationId { get; set; }
        public Guid? ActorId { get; set; }
        public string? EntityType { get; set; }
        public Guid? EntityId { get; set; }
        public string? Action { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? ActorName { get; set; }
        public string? ActorEmail { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
