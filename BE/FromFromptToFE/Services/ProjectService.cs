using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;

namespace FromFromptToFE.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _repository;
        private readonly IMapper _mapper;

        public ProjectService(IProjectRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<PagingResult<ProjectDto>> GetAllProjectsAsync(ProjectFilterDto filter)
        {
            var (items, totalCount) = await _repository.GetPagedAsync(
                filter.Search,
                filter.OrganizationId,
                filter.ProjectType,
                filter.PageIndex,
                filter.PageSize);

            return new PagingResult<ProjectDto>
            {
                TotalItems = _mapper.Map<List<ProjectDto>>(items),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        public async Task<ProjectDto?> GetProjectByIdAsync(Guid id)
        {
            var project = await _repository.GetByIdAsync(id);
            return project == null ? null : _mapper.Map<ProjectDto>(project);
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto createDto)
        {
            var project = _mapper.Map<Project>(createDto);
            project.CreatedAt = DateTime.UtcNow;
            await _repository.AddAsync(project);
            return _mapper.Map<ProjectDto>(project);
        }

        public async Task<bool> UpdateProjectAsync(Guid id, UpdateProjectDto updateDto)
        {
            var project = await _repository.GetByIdAsync(id);
            if (project == null) return false;

            _mapper.Map(updateDto, project);
            await _repository.UpdateAsync(project);
            return true;
        }

        public async Task<bool> DeleteProjectAsync(Guid id)
        {
            var project = await _repository.GetByIdAsync(id);
            if (project == null) return false;

            await _repository.DeleteAsync(project);
            return true;
        }
    }
}
