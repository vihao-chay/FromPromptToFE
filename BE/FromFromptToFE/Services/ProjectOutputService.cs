using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FromFromptToFE.DTOs.Page;
using FromFromptToFE.DTOs.ProjectOutput;
using FromFromptToFE.Base;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Repositories.Interfaces;
using FromFromptToFE.Services.Interfaces;

namespace FromFromptToFE.Services
{
    public class ProjectOutputService : IProjectOutputService
    {
        private readonly IProjectOutputRepository _projectOutputRepo;
        private readonly IProjectRepository _projectRepo;
        private readonly IPageRepository _pageRepo;

        public ProjectOutputService(
            IProjectOutputRepository projectOutputRepo,
            IProjectRepository projectRepo,
            IPageRepository pageRepo)
        {
            _projectOutputRepo = projectOutputRepo;
            _projectRepo = projectRepo;
            _pageRepo = pageRepo;
        }

        public async Task<IEnumerable<ProjectOutputDto>> GetAllByProjectIdAsync(Guid projectId)
        {
            var outputs = await _projectOutputRepo.GetAllByProjectIdAsync(projectId);
            return outputs.Select(o => MapToDto(o, includePages: false));
        }

        public async Task<PagingResult<ProjectOutputDto>> GetPagedByProjectIdAsync(ProjectOutputFilterDto filter)
        {
            var (items, totalCount) = await _projectOutputRepo.GetPagedByProjectIdAsync(
                filter.ProjectId, filter.Search, filter.Status, filter.SortBy, filter.SortOrder,
                filter.PageIndex, filter.PageSize);
            return new PagingResult<ProjectOutputDto>
            {
                TotalItems = items.Select(o => MapToDto(o, includePages: false)).ToList(),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        private static ProjectOutputDto MapToDto(ProjectOutput o, bool includePages)
        {
            var dto = new ProjectOutputDto
            {
                Id = o.Id,
                ProjectId = o.ProjectId,
                Version = o.Version,
                Status = o.Status,
                TriggeredBy = o.TriggeredBy,
                CreatedAt = o.CreatedAt,
                SystemPrompt = o.SystemPrompt,
                UserPrompt = o.UserPrompt,
                PromptHistory = o.PromptHistory,
                GeneratedTsx = o.GeneratedTsx,
                GeneratedHtml = o.GeneratedHtml,
                StepOutput = o.StepOutput,
                GeneratedPreviewImage = o.GeneratedPreviewImage
            };
            if (includePages && o.Pages != null)
            {
                dto.Pages = o.Pages.Select(p => new PageDto
                {
                    Id = p.Id,
                    ProjectOutputId = p.ProjectOutputId,
                    Route = p.Route,
                    PageType = p.PageType,
                    EntityName = p.EntityName,
                    GeneratedCode = p.GeneratedCode,
                    FileName = p.FileName,
                    CreatedAt = p.CreatedAt
                }).ToList();
            }
            return dto;
        }

        public async Task<ProjectOutputDto> SaveOutputAsync(Guid projectId, Guid userId, SaveProjectOutputDto dto)
        {
            var project = await _projectRepo.GetByIdAsync(projectId);
            if (project == null) throw new Exception("Project not found");

            var previousOutputs = (await _projectOutputRepo.GetAllByProjectIdAsync(projectId)).ToList();
            var version = $"v{previousOutputs.Count + 1}.0";

            var output = new ProjectOutput
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                Version = version,
                Status = dto.TaskStatus ?? "Success",
                TriggeredBy = userId,
                CreatedAt = DateTime.UtcNow,
                SystemPrompt = dto.SystemPrompt,
                UserPrompt = dto.UserPrompt,
                PromptHistory = dto.PromptHistory,
                GeneratedTsx = dto.GeneratedTsx,
                GeneratedHtml = dto.GeneratedHtml,
                StepOutput = dto.StepOutput,
                GeneratedPreviewImage = dto.GeneratedPreviewImage
            };

            await _projectOutputRepo.AddAsync(output);
            await _projectOutputRepo.SaveChangesAsync();

            var saved = await _projectOutputRepo.GetProjectOutputWithDetailsAsync(output.Id);
            return MapToDto(saved ?? output, includePages: true);
        }

        public async Task<ProjectOutputDto?> GetByIdAsync(Guid id)
        {
            var output = await _projectOutputRepo.GetProjectOutputWithDetailsAsync(id);
            if (output == null) return null;

            return MapToDto(output, includePages: true);
        }

        public async Task<ProjectOutputDto> AddPagesToOutputAsync(Guid outputId, IEnumerable<CreatePageDto> pages)
        {
            var output = await _projectOutputRepo.GetProjectOutputWithDetailsAsync(outputId);
            if (output == null) throw new Exception("Project output not found");

            var list = pages?.ToList() ?? new List<CreatePageDto>();
            foreach (var dto in list)
            {
                var page = new Page
                {
                    Id = Guid.NewGuid(),
                    ProjectOutputId = outputId,
                    Route = dto.Route,
                    PageType = dto.PageType,
                    EntityName = dto.EntityName,
                    GeneratedCode = dto.GeneratedCode,
                    FileName = dto.FileName,
                    CreatedAt = DateTime.UtcNow
                };
                await _pageRepo.AddAsync(page);
            }
            await _pageRepo.SaveChangesAsync();

            return await GetByIdAsync(outputId) ?? throw new Exception("Failed to retrieve output after adding pages");
        }

        public async Task<ProjectOutputDto> GenerateCodeAsync(Guid projectId, Guid userId)
        {
            var project = await _projectRepo.GetByIdAsync(projectId);
            if (project == null) throw new Exception("Project not found");

            // 1. Create a new Pending ProjectOutput
            var previousOutputsCount = (await _projectOutputRepo.GetAllByProjectIdAsync(projectId)).Count();
            var newOutput = new ProjectOutput
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                Version = $"v{previousOutputsCount + 1}.0",
                Status = "Processing",
                TriggeredBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            await _projectOutputRepo.AddAsync(newOutput);
            await _projectOutputRepo.SaveChangesAsync();

            try
            {
                // 2. Không gọi LLM ở BE — FE sẽ dùng Gemini, rồi gửi pages (nếu có API nhận) hoặc tạo output trống
                // 3. Update Status to Completed
                newOutput.Status = "Completed";
                await _projectOutputRepo.UpdateAsync(newOutput);
                await _projectOutputRepo.SaveChangesAsync();
                await _pageRepo.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Handle Failure
                newOutput.Status = "Failed";
                await _projectOutputRepo.UpdateAsync(newOutput);
                await _projectOutputRepo.SaveChangesAsync();
                throw new Exception($"Generation failed: {ex.Message}");
            }

            return await GetByIdAsync(newOutput.Id) ?? throw new Exception("Failed to retrieve generated output");
        }
    }
}
