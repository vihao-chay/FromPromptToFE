
using FromFromptToFE.Models;

namespace FromFromptToFE.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByVerifyTokenAsync(string token);
        Task<User?> GetByResetTokenAsync(string token);
        Task<User?> GetByRefreshTokenAsync(string token);
        Task<List<string>> GetRolesAsync(Guid userId); // Thêm dòng này
    }
}
