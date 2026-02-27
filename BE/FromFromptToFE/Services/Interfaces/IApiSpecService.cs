using FromFromptToFE.Base;
using FromFromptToFE.DTOs;

namespace FromFromptToFE.Services
{
    public interface IApiSpecService
    {
        Task<PagingResult<ApiSpecDto>> GetAllApiSpecsAsync(ApiSpecFilterDto filter);
        Task<ApiSpecDto?> GetApiSpecByIdAsync(Guid id);
        Task<ApiSpecDto> CreateApiSpecAsync(CreateApiSpecDto createDto);
        Task<bool> UpdateApiSpecAsync(Guid id, UpdateApiSpecDto updateDto);
        Task<bool> DeleteApiSpecAsync(Guid id);
    }
}
