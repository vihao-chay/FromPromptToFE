using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FromFromptToFE.DTOs.ProjectOutput;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IProjectOutputService
    {
        Task<IEnumerable<ProjectOutputDto>> GetAllByProjectIdAsync(Guid projectId);
        Task<ProjectOutputDto?> GetByIdAsync(Guid id);
        Task<ProjectOutputDto> GenerateCodeAsync(Guid projectId, Guid userId);
    }
}
