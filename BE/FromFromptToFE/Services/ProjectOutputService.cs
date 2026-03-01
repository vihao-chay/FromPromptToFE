using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FromFromptToFE.DTOs.Page;
using FromFromptToFE.DTOs.ProjectOutput;
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
        private readonly ILLMService _llmService;

        public ProjectOutputService(
            IProjectOutputRepository projectOutputRepo,
            IProjectRepository projectRepo,
            IPageRepository pageRepo,
            ILLMService llmService)
        {
            _projectOutputRepo = projectOutputRepo;
            _projectRepo = projectRepo;
            _pageRepo = pageRepo;
            _llmService = llmService;
        }

        public async Task<IEnumerable<ProjectOutputDto>> GetAllByProjectIdAsync(Guid projectId)
        {
            var outputs = await _projectOutputRepo.GetAllByProjectIdAsync(projectId);
            return outputs.Select(o => new ProjectOutputDto
            {
                Id = o.Id,
                ProjectId = o.ProjectId,
                Version = o.Version,
                Status = o.Status,
                TriggeredBy = o.TriggeredBy,
                CreatedAt = o.CreatedAt
            });
        }

        public async Task<ProjectOutputDto?> GetByIdAsync(Guid id)
        {
            var output = await _projectOutputRepo.GetProjectOutputWithDetailsAsync(id);
            if (output == null) return null;

            return new ProjectOutputDto
            {
                Id = output.Id,
                ProjectId = output.ProjectId,
                Version = output.Version,
                Status = output.Status,
                TriggeredBy = output.TriggeredBy,
                CreatedAt = output.CreatedAt,
                Pages = output.Pages.Select(p => new PageDto
                {
                    Id = p.Id,
                    ProjectOutputId = p.ProjectOutputId,
                    Route = p.Route,
                    PageType = p.PageType,
                    EntityName = p.EntityName,
                    CreatedAt = p.CreatedAt
                }).ToList()
            };
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
                // 2. Call LLM Service (Mocked)
                var generatedPages = await _llmService.GeneratePagesMockAsync(
                    project.SystemPrompt ?? "", 
                    project.EntitySchema ?? "", 
                    project.ProjectType);

                // 3. Save Generated Pages
                foreach (var mockPage in generatedPages)
                {
                    var newPage = new Page
                    {
                        Id = Guid.NewGuid(),
                        ProjectOutputId = newOutput.Id,
                        Route = mockPage.Route,
                        PageType = mockPage.PageType,
                        EntityName = mockPage.EntityName,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _pageRepo.AddAsync(newPage);
                }
                
                // 4. Update Status to Completed
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
