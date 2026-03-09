using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using System;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IChangeLogService
    {
        Task<ChangeLogDto> CreateAsync(CreateChangeLogDto dto, Guid? actorId);
        Task<ChangeLogDto?> GetByIdAsync(Guid id);
        Task<PagingResult<ChangeLogDto>> GetPagedAsync(ChangeLogFilterDto filter);
    }
}
