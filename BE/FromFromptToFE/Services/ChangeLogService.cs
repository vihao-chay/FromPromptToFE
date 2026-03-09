using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Services.Interfaces;
using System;

namespace FromFromptToFE.Services
{
    public class ChangeLogService : IChangeLogService
    {
        private readonly IChangeLogRepository _repository;
        private readonly IMapper _mapper;

        public ChangeLogService(IChangeLogRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<ChangeLogDto> CreateAsync(CreateChangeLogDto dto, Guid? actorId)
        {
            var entity = _mapper.Map<ChangeLog>(dto);
            entity.ActorId = actorId;
            entity.CreatedAt = DateTime.UtcNow;
            await _repository.AddAsync(entity);
            return _mapper.Map<ChangeLogDto>(entity);
        }

        public async Task<ChangeLogDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            return _mapper.Map<ChangeLogDto>(entity);
        }

        public async Task<PagingResult<ChangeLogDto>> GetPagedAsync(ChangeLogFilterDto filter)
        {
            var (items, totalCount) = await _repository.GetPagedAsync(
                filter.Search, filter.OrganizationId, filter.EntityType, filter.Action,
                filter.SortBy, filter.SortOrder, filter.PageIndex, filter.PageSize);
            return new PagingResult<ChangeLogDto>
            {
                TotalItems = _mapper.Map<List<ChangeLogDto>>(items),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }
    }
}
