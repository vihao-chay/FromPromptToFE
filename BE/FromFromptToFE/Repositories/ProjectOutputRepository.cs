using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;
using FromFromptToFE.Repositories.Interfaces;
using FromFromptToFE.Data;

namespace FromFromptToFE.Repositories
{
    public class ProjectOutputRepository : Repository<ProjectOutput>, IProjectOutputRepository
    {
        public ProjectOutputRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ProjectOutput>> GetAllByProjectIdAsync(Guid projectId)
        {
            return await _dbSet
                .Where(x => x.ProjectId == projectId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
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
