using System;
using System.Collections.Generic;
using FromFromptToFE.DTOs.Page;

namespace FromFromptToFE.DTOs.ProjectOutput
{
    public class ProjectOutputFilterDto
    {
        public Guid ProjectId { get; set; }
        public string? Search { get; set; }
        public string? Status { get; set; }
        /// <summary>Sort field: Version, Status, CreatedAt. Default CreatedAt.</summary>
        public string? SortBy { get; set; }
        /// <summary>asc | desc. Default desc.</summary>
        public string? SortOrder { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    /// <summary>Payload to save one generation result into project_outputs (code, preview, task status, step output, all prompts).</summary>
    public class SaveProjectOutputDto
    {
        public string? GeneratedTsx { get; set; }
        public string? GeneratedHtml { get; set; }
        public string? SystemPrompt { get; set; }
        public string? UserPrompt { get; set; }
        /// <summary>Task status: e.g. Success, Failed, Pending, Running.</summary>
        public string? TaskStatus { get; set; }
        /// <summary>Step output when generating code (JSON string).</summary>
        public string? StepOutput { get; set; }
        /// <summary>All prompts for this generation (JSON array).</summary>
        public string? PromptHistory { get; set; }
        public string? GeneratedPreviewImage { get; set; }
    }

    public class ProjectOutputDto
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string? Version { get; set; }
        public string? Status { get; set; }
        public Guid? TriggeredBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? SystemPrompt { get; set; }
        public string? UserPrompt { get; set; }
        public string? PromptHistory { get; set; }
        public string? GeneratedTsx { get; set; }
        public string? GeneratedHtml { get; set; }
        public string? StepOutput { get; set; }
        public string? GeneratedPreviewImage { get; set; }

        public IEnumerable<PageDto> Pages { get; set; } = new List<PageDto>();
    }
}
