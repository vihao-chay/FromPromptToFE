using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FromFromptToFE.DTOs.Page;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IPageService
    {
        Task<IEnumerable<PageDto>> GetPagesByOutputIdAsync(Guid outputId);
        Task<PageDto?> UpdatePageAsync(Guid id, UpdatePageDto dto);
    }
}
