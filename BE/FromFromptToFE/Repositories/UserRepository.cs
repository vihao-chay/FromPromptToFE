
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByVerifyTokenAsync(string token)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.VerifyToken == token);
        }

        public async Task<User?> GetByResetTokenAsync(string token)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.ResetToken == token);
        }

        public async Task<User?> GetByRefreshTokenAsync(string token)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.RefreshToken == token);
        }

        public async Task<List<string>> GetRolesAsync(Guid userId)
        {
            return await _context.OrganizationMembers
                .Where(om => om.UserId == userId)
                .Select(om => om.Role)
                .ToListAsync();
        }
    }
}
