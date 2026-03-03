
using FromFromptToFE.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace FromFromptToFE.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly PostgresContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(PostgresContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<T?> GetByIdAsync(Guid id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<T?> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.FirstOrDefaultAsync(predicate);
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            // In a Unit of Work pattern, SaveChanges wouldn't be here. 
            // But for simplicity in this request, we keep it or rely on service to call SaveChanges if we had a UoW.
            // However, the common simple repository pattern usually includes SaveChanges or delegates it.
            // Given the previous code called SaveChanges directly, I will add it here for now to keep it working simply.
            // But wait, usually Repository just modifies state and a UnitOfWork calls SaveChanges.
            // Or the service calls SaveChanges on the Context.
            
            // To be safe and simple: I'll assume we want the change to persist immediately for now, 
            // OR I can expose a SaveChanges method. 
            // Let's stick to the simplest valid implementation: helper methods for DB interaction.
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
