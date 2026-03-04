using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Repositories.Interfaces;

namespace FromFromptToFE.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _repository;
        private readonly IProjectOutputRepository _outputRepository;
        private readonly IMapper _mapper;

        public ProjectService(IProjectRepository repository, IProjectOutputRepository outputRepository, IMapper mapper)
        {
            _repository = repository;
            _outputRepository = outputRepository;
            _mapper = mapper;
        }

        public async Task<PagingResult<ProjectDto>> GetAllProjectsAsync(ProjectFilterDto filter)
        {
            var (items, totalCount) = await _repository.GetPagedAsync(
                filter.Search,
                filter.OrganizationId,
                filter.ProjectType,
                filter.SortBy,
                filter.SortOrder,
                filter.PageIndex,
                filter.PageSize);

            var dtos = _mapper.Map<List<ProjectDto>>(items);
            try
            {
                var projectIds = dtos.Select(p => p.Id).ToList();
                if (projectIds.Count > 0)
                {
                    var latestOutputs = await _outputRepository.GetLatestByProjectIdsAsync(projectIds);
                    foreach (var dto in dtos)
                    {
                        if (latestOutputs.TryGetValue(dto.Id, out var output))
                        {
                            dto.GeneratedHtml = output.GeneratedHtml;
                            dto.GeneratedTsx = output.GeneratedTsx;
                        }
                    }
                }
            }
            catch (Exception)
            {
                // If project_outputs query fails (e.g. schema mismatch), return projects without latest output.
            }

            return new PagingResult<ProjectDto>
            {
                TotalItems = dtos,
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        public async Task<ProjectDto?> GetProjectByIdAsync(Guid id)
        {
            var project = await _repository.GetByIdAsync(id);
            if (project == null) return null;
            var dto = _mapper.Map<ProjectDto>(project);
            try
            {
                var latest = await _outputRepository.GetLatestByProjectIdAsync(id);
                if (latest != null)
                {
                    dto.GeneratedHtml = latest.GeneratedHtml;
                    dto.GeneratedTsx = latest.GeneratedTsx;
                }
            }
            catch { /* ignore if project_outputs query fails */ }
            return dto;
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto createDto)
        {
            var project = _mapper.Map<Project>(createDto);
            project.Id = Guid.NewGuid();
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
