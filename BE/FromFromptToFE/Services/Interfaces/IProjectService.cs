using FromFromptToFE.Base;
using FromFromptToFE.DTOs;

namespace FromFromptToFE.Services
{
    public interface IProjectService
    {
        Task<PagingResult<ProjectDto>> GetAllProjectsAsync(ProjectFilterDto filter);
        Task<ProjectDto?> GetProjectByIdAsync(Guid id);
        Task<ProjectDto> CreateProjectAsync(CreateProjectDto createDto);
        Task<bool> UpdateProjectAsync(Guid id, UpdateProjectDto updateDto);
        Task<bool> DeleteProjectAsync(Guid id);
    }
}
