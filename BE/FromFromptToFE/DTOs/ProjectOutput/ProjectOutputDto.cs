using System;
using System.Collections.Generic;
using FromFromptToFE.DTOs.Page;

namespace FromFromptToFE.DTOs.ProjectOutput
{
    public class ProjectOutputDto
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string? Version { get; set; }
        public string? Status { get; set; }
        public Guid? TriggeredBy { get; set; }
        public DateTime? CreatedAt { get; set; }

        public IEnumerable<PageDto> Pages { get; set; } = new List<PageDto>();
    }
}
