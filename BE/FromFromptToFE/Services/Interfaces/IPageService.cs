using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs.Page;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IPageService
    {
        Task<IEnumerable<PageDto>> GetPagesByOutputIdAsync(Guid outputId);
        Task<PagingResult<PageDto>> GetPagedByOutputIdAsync(PageFilterDto filter);
        Task<PageDto?> UpdatePageAsync(Guid id, UpdatePageDto dto);
    }
}
