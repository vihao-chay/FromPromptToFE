using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;

namespace FromFromptToFE.Services
{
    public class ApiSpecOutputService : IApiSpecOutputService
    {
        private readonly IApiSpecOutputRepository _repository;
        private readonly IMapper _mapper;

        public ApiSpecOutputService(IApiSpecOutputRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<PagingResult<ApiSpecOutputDto>> GetAllApiSpecOutputsAsync(ApiSpecOutputFilterDto filter)
        {
            var (items, totalCount) = await _repository.GetPagedAsync(
                filter.Search,
                filter.ApiSpecId,
                filter.Version,
                filter.SortBy,
                filter.SortOrder,
                filter.PageIndex,
                filter.PageSize);

            return new PagingResult<ApiSpecOutputDto>
            {
                TotalItems = _mapper.Map<List<ApiSpecOutputDto>>(items),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        public async Task<ApiSpecOutputDto?> GetApiSpecOutputByIdAsync(Guid id)
        {
            var apiSpecOutput = await _repository.GetByIdAsync(id);
            return apiSpecOutput == null ? null : _mapper.Map<ApiSpecOutputDto>(apiSpecOutput);
        }

        public async Task<ApiSpecOutputDto> CreateApiSpecOutputAsync(CreateApiSpecOutputDto createDto)
        {
            var apiSpecOutput = _mapper.Map<ApiSpecOutput>(createDto);
            apiSpecOutput.CreatedAt = DateTime.UtcNow;
            await _repository.AddAsync(apiSpecOutput);
            return _mapper.Map<ApiSpecOutputDto>(apiSpecOutput);
        }

        public async Task<bool> UpdateApiSpecOutputAsync(Guid id, UpdateApiSpecOutputDto updateDto)
        {
            var apiSpecOutput = await _repository.GetByIdAsync(id);
            if (apiSpecOutput == null) return false;

            _mapper.Map(updateDto, apiSpecOutput);
            await _repository.UpdateAsync(apiSpecOutput);
            return true;
        }

        public async Task<bool> DeleteApiSpecOutputAsync(Guid id)
        {
            var apiSpecOutput = await _repository.GetByIdAsync(id);
            if (apiSpecOutput == null) return false;

            await _repository.DeleteAsync(apiSpecOutput);
            return true;
        }
    }
}
