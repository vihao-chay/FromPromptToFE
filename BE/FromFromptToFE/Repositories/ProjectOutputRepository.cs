using System;
using System.Collections.Generic;
using System.Linq;
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Repositories
{
    public class ProjectOutputRepository : Repository<ProjectOutput>, IProjectOutputRepository
    {
        public ProjectOutputRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<ProjectOutput?> GetLatestByProjectIdAsync(Guid projectId)
        {
            return await _dbSet
                .Where(x => x.ProjectId == projectId)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<IReadOnlyDictionary<Guid, ProjectOutput>> GetLatestByProjectIdsAsync(IEnumerable<Guid> projectIds)
        {
            var ids = projectIds.Distinct().ToList();
            if (ids.Count == 0) return new Dictionary<Guid, ProjectOutput>();

            var outputs = await _dbSet
                .Where(x => ids.Contains(x.ProjectId))
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            var dict = new Dictionary<Guid, ProjectOutput>();
            foreach (var o in outputs)
            {
                if (!dict.ContainsKey(o.ProjectId))
                    dict[o.ProjectId] = o;
            }
            return dict;
        }

        public async Task<IEnumerable<ProjectOutput>> GetAllByProjectIdAsync(Guid projectId)
        {
            return await _dbSet
                .Where(x => x.ProjectId == projectId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<(IEnumerable<ProjectOutput> Items, int TotalCount)> GetPagedByProjectIdAsync(Guid projectId, string? search, string? status, string? sortBy, string? sortOrder, int pageIndex, int pageSize)
        {
            var query = _dbSet.Where(x => x.ProjectId == projectId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(x => x.Status != null && x.Status.Contains(status));
            if (!string.IsNullOrEmpty(search))
            {
                var isGuid = Guid.TryParse(search, out var guidSearch);
                query = query.Where(x =>
                    (isGuid && x.Id == guidSearch) ||
                    (x.Version != null && x.Version.Contains(search)) ||
                    (x.Status != null && x.Status.Contains(search)));
            }

            var isDesc = !string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);
            query = (sortBy?.ToLowerInvariant()) switch
            {
                "version" => isDesc ? query.OrderByDescending(x => x.Version) : query.OrderBy(x => x.Version),
                "status" => isDesc ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
                _ => isDesc ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }

        public async Task<ProjectOutput?> GetProjectOutputWithDetailsAsync(Guid id)
        {
            return await _dbSet
                .Include(x => x.Pages)
                .Include(x => x.Project)
                .Include(x => x.TriggeredByNavigation)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
