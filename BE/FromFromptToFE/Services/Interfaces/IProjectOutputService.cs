using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FromFromptToFE.DTOs.Page;
using FromFromptToFE.DTOs.ProjectOutput;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IProjectOutputService
    {
        Task<IEnumerable<ProjectOutputDto>> GetAllByProjectIdAsync(Guid projectId);
        Task<ProjectOutputDto?> GetByIdAsync(Guid id);
        Task<ProjectOutputDto> GenerateCodeAsync(Guid projectId, Guid userId);
        /// <summary>FE gửi danh sách pages (từ Gemini) để lưu vào output.</summary>
        Task<ProjectOutputDto> AddPagesToOutputAsync(Guid outputId, IEnumerable<CreatePageDto> pages);
    }
}
