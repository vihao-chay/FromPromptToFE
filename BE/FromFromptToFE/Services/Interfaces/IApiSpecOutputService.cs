using FromFromptToFE.Base;
using FromFromptToFE.DTOs;

namespace FromFromptToFE.Services
{
    public interface IApiSpecOutputService
    {
        Task<PagingResult<ApiSpecOutputDto>> GetAllApiSpecOutputsAsync(ApiSpecOutputFilterDto filter);
        Task<ApiSpecOutputDto?> GetApiSpecOutputByIdAsync(Guid id);
        Task<ApiSpecOutputDto> CreateApiSpecOutputAsync(CreateApiSpecOutputDto createDto);
        Task<bool> UpdateApiSpecOutputAsync(Guid id, UpdateApiSpecOutputDto updateDto);
        Task<bool> DeleteApiSpecOutputAsync(Guid id);
    }
}
