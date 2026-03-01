using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FromFromptToFE.DTOs.Page;
using FromFromptToFE.Repositories.Interfaces;
using FromFromptToFE.Services.Interfaces;

namespace FromFromptToFE.Services
{
    public class PageService : IPageService
    {
        private readonly IPageRepository _pageRepo;

        public PageService(IPageRepository pageRepo)
        {
            _pageRepo = pageRepo;
        }

        public async Task<IEnumerable<PageDto>> GetPagesByOutputIdAsync(Guid outputId)
        {
            var pages = await _pageRepo.GetPagesByProjectOutputIdAsync(outputId);
            return pages.Select(p => new PageDto
            {
                Id = p.Id,
                ProjectOutputId = p.ProjectOutputId,
                Route = p.Route,
                PageType = p.PageType,
                EntityName = p.EntityName,
                CreatedAt = p.CreatedAt
            });
        }
    }
}
