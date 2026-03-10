using System;
using System.ComponentModel.DataAnnotations;

namespace FromFromptToFE.DTOs
{
    public class CreateChangeLogDto
    {
        public Guid? OrganizationId { get; set; }
        [Required]
        [StringLength(100)]
        public string EntityType { get; set; } = null!;
        public Guid? EntityId { get; set; }
        [Required]
        [StringLength(100)]
        public string Action { get; set; } = null!;
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
    }
}
