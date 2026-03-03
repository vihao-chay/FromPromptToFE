using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Repositories;

namespace FromFromptToFE.Services;

public class CodeService : ICodeService
{
    private readonly ICodeRepository _repository;
    private readonly IMapper _mapper;

    public CodeService(ICodeRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<PagingResult<CodeDto>> GetAllAsync(CodeFilterDto filter)
    {
        var (items, totalCount) = await _repository.GetPagedAsync(
            filter.Search,
            filter.UserId,
            filter.Status,
            filter.PageIndex,
            filter.PageSize);

        return new PagingResult<CodeDto>
        {
            TotalItems = _mapper.Map<List<CodeDto>>(items),
            TotalRow = totalCount,
            PageIndex = filter.PageIndex,
            PageSize = filter.PageSize
        };
    }

    public async Task<CodeDto?> GetByIdAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<CodeDto>(entity);
    }
}
