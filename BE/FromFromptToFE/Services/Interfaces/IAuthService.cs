
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
        Task ForgotPasswordAsync(ForgotPasswordDto dto);
        Task<AuthResponseDto?> ResetPasswordAsync(ResetPasswordDto dto);
        Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
        Task<UserDto?> GetCurrentUserAsync(Guid userId);
        Task ResendVerificationEmailAsync(ResendVerificationDto dto);
        Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenDto dto);
    }
}
