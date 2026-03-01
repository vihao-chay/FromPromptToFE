using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;
using FromFromptToFE.Repositories.Interfaces;
using FromFromptToFE.Data;

namespace FromFromptToFE.Repositories
{
    public class PageRepository : Repository<Page>, IPageRepository
    {
        public PageRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Page>> GetPagesByProjectOutputIdAsync(Guid projectOutputId)
        {
            return await _dbSet
                .Where(x => x.ProjectOutputId == projectOutputId)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }
    }
}
