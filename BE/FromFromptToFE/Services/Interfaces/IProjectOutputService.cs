using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FromFromptToFE.DTOs.Page;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs.ProjectOutput;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IProjectOutputService
    {
        Task<IEnumerable<ProjectOutputDto>> GetAllByProjectIdAsync(Guid projectId);
        Task<PagingResult<ProjectOutputDto>> GetPagedByProjectIdAsync(ProjectOutputFilterDto filter);
        Task<ProjectOutputDto?> GetByIdAsync(Guid id);
        Task<ProjectOutputDto> GenerateCodeAsync(Guid projectId, Guid userId);
        /// <summary>FE gửi danh sách pages (từ Gemini) để lưu vào output.</summary>
        Task<ProjectOutputDto> AddPagesToOutputAsync(Guid outputId, IEnumerable<CreatePageDto> pages);
        /// <summary>Lưu kết quả generate (code, html, prompts, task status, step output) vào project_outputs.</summary>
        Task<ProjectOutputDto> SaveOutputAsync(Guid projectId, Guid userId, SaveProjectOutputDto dto);
    }
}
