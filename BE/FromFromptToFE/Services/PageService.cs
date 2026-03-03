using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FromFromptToFE.Base;
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
            return pages.Select(MapToDto).ToList();
        }

        public async Task<PagingResult<PageDto>> GetPagedByOutputIdAsync(PageFilterDto filter)
        {
            var (items, totalCount) = await _pageRepo.GetPagedByProjectOutputIdAsync(
                filter.OutputId, filter.Search, filter.PageType, filter.EntityName,
                filter.SortBy, filter.SortOrder, filter.PageIndex, filter.PageSize);
            return new PagingResult<PageDto>
            {
                TotalItems = items.Select(MapToDto).ToList(),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        private static PageDto MapToDto(Models.Page p)
        {
            return new PageDto
            {
                Id = p.Id,
                ProjectOutputId = p.ProjectOutputId,
                Route = p.Route,
                PageType = p.PageType,
                EntityName = p.EntityName,
                GeneratedCode = p.GeneratedCode,
                FileName = p.FileName,
                CreatedAt = p.CreatedAt
            };
        }

        public async Task<PageDto?> UpdatePageAsync(Guid id, UpdatePageDto dto)
        {
            var page = await _pageRepo.GetByIdAsync(id);
            if (page == null) return null;

            if (dto.Route != null) page.Route = dto.Route;
            if (dto.PageType != null) page.PageType = dto.PageType;
            if (dto.EntityName != null) page.EntityName = dto.EntityName;
            if (dto.GeneratedCode != null) page.GeneratedCode = dto.GeneratedCode;
            if (dto.FileName != null) page.FileName = dto.FileName;

            await _pageRepo.UpdateAsync(page);
            await _pageRepo.SaveChangesAsync();

            var updated = await _pageRepo.GetByIdAsync(id);
            return updated == null ? null : MapToDto(updated);
        }
    }
}
