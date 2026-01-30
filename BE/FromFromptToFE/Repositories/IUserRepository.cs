
using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByVerifyTokenAsync(string token);
    }
}
