using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;

namespace FromFromptToFE.Services
{
    public class ApiSpecService : IApiSpecService
    {
        private readonly IApiSpecRepository _repository;
        private readonly IMapper _mapper;

        public ApiSpecService(IApiSpecRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<PagingResult<ApiSpecDto>> GetAllApiSpecsAsync(ApiSpecFilterDto filter)
        {
            var (items, totalCount) = await _repository.GetPagedAsync(
                filter.Search,
                filter.ProjectId,
                filter.SpecType,
                filter.SortBy,
                filter.SortOrder,
                filter.PageIndex,
                filter.PageSize);

            return new PagingResult<ApiSpecDto>
            {
                TotalItems = _mapper.Map<List<ApiSpecDto>>(items),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        public async Task<ApiSpecDto?> GetApiSpecByIdAsync(Guid id)
        {
            var apiSpec = await _repository.GetByIdAsync(id);
            return apiSpec == null ? null : _mapper.Map<ApiSpecDto>(apiSpec);
        }

        public async Task<ApiSpecDto> CreateApiSpecAsync(CreateApiSpecDto createDto)
        {
            var apiSpec = _mapper.Map<ApiSpec>(createDto);
            apiSpec.CreatedAt = DateTime.UtcNow;
            await _repository.AddAsync(apiSpec);
            return _mapper.Map<ApiSpecDto>(apiSpec);
        }

        public async Task<bool> UpdateApiSpecAsync(Guid id, UpdateApiSpecDto updateDto)
        {
            var apiSpec = await _repository.GetByIdAsync(id);
            if (apiSpec == null) return false;

            _mapper.Map(updateDto, apiSpec);
            await _repository.UpdateAsync(apiSpec);
            return true;
        }

        public async Task<bool> DeleteApiSpecAsync(Guid id)
        {
            var apiSpec = await _repository.GetByIdAsync(id);
            if (apiSpec == null) return false;

            await _repository.DeleteAsync(apiSpec);
            return true;
        }
    }
}
