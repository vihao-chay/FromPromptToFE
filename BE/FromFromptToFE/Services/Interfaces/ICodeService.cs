using FromFromptToFE.Base;
using FromFromptToFE.DTOs;

namespace FromFromptToFE.Services;

public interface ICodeService
{
    Task<PagingResult<CodeDto>> GetAllAsync(CodeFilterDto filter);
    Task<CodeDto?> GetByIdAsync(Guid id);
}
