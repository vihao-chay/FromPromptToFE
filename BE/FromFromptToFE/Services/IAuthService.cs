
using FromFromptToFE.DTOs.Auth;
using FromFromptToFE.Models;

namespace FromFromptToFE.Services
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(RegisterDto dto);
        Task<bool> VerifyEmailAsync(string token);
        Task<AuthResponseDto?> LoginAsync(LoginDto dto);
        Task<AuthResponseDto> GoogleLoginAsync(string idToken);
    }
}
