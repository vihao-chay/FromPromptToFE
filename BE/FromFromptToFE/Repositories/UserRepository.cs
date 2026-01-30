
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
    }
}
