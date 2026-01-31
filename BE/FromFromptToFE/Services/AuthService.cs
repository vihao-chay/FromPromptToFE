using AutoMapper;
using FromFromptToFE.DTOs.Auth;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Helpers;
using Google.Apis.Auth;

namespace FromFromptToFE.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IJwtAuthService _jwtAuthService;
        private readonly IEmailService _emailService;

        public AuthService(
            IUserRepository userRepository, 
            IMapper mapper, 
            IJwtAuthService jwtAuthService,
            IEmailService emailService)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _jwtAuthService = jwtAuthService;
            _emailService = emailService;
        }

        public async Task<User> RegisterAsync(RegisterDto dto)
        {
            if (await _userRepository.GetByEmailAsync(dto.Email) != null)
            {
                throw new Exception("Email đã tồn tại");
            }

            var user = _mapper.Map<User>(dto);
            user.PasswordHash = PasswordHelper.HashPassword(dto.Password);
            user.VerifyToken = Guid.NewGuid().ToString("N");
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.AddAsync(user);

            // Gửi email verification
            try
            {
                await _emailService.SendVerificationEmailAsync(
                    user.Email,
                    user.Name ?? "User",
                    user.VerifyToken
                );
            }
            catch (Exception ex)
            {
                // Log error nhưng vẫn return success vì user đã được tạo
                Console.WriteLine($"Warning: Failed to send verification email: {ex.Message}");
            }

            return user;
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            var user = await _userRepository.GetByVerifyTokenAsync(token);
            if (user == null) return false;

            user.IsVerified = true;
            user.VerifyToken = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            
            // Allow login if password matches, using helper
            if (user == null || string.IsNullOrEmpty(user.PasswordHash) || !PasswordHelper.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return null;
            }

            if (user.IsVerified != true)
            {
                throw new Exception("Tài khoản chưa được xác thực");
            }

            var roles = await _userRepository.GetRolesAsync(user.Id);
            var role = roles.FirstOrDefault() ?? "User";

            var response = _mapper.Map<AuthResponseDto>(user);
            response.Role = role;
            response.Token = _jwtAuthService.GenerateToken(user, role);
            response.RefreshToken = _jwtAuthService.GenerateRefreshToken();
            
            user.RefreshToken = response.RefreshToken;
            user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return response;
        }

        public async Task<AuthResponseDto> GoogleLoginAsync(string idToken)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);
                var user = await _userRepository.GetByEmailAsync(payload.Email);

                if (user == null)
                {
                    user = new User
                    {
                        Email = payload.Email,
                        Name = payload.Name,
                        GoogleId = payload.Subject,
                        AvatarUrl = payload.Picture,
                        IsVerified = true,
                        Provider = "google",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    await _userRepository.AddAsync(user);
                }
                else if (user.GoogleId == null)
                {
                    user.GoogleId = payload.Subject;
                    user.AvatarUrl = payload.Picture ?? user.AvatarUrl;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _userRepository.UpdateAsync(user);
                }

                var roles = await _userRepository.GetRolesAsync(user.Id);
                var role = roles.FirstOrDefault() ?? "User";

                var response = _mapper.Map<AuthResponseDto>(user);
                response.Role = role;
                response.Token = _jwtAuthService.GenerateToken(user, role);
                response.RefreshToken = _jwtAuthService.GenerateRefreshToken();

                user.RefreshToken = response.RefreshToken;
                user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);

                return response;
            }
            catch (InvalidJwtException)
            {
                throw new Exception("Token Google không hợp lệ");
            }
        }

        public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null) return; // Bảo mật: không báo lỗi nếu email không tồn tại

            user.ResetToken = Guid.NewGuid().ToString("N");
            user.ResetTokenExpires = DateTime.UtcNow.AddHours(1);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            await _emailService.SendPasswordResetEmailAsync(user.Email, user.Name ?? "User", user.ResetToken);
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _userRepository.GetByResetTokenAsync(dto.Token);
            if (user == null || user.ResetTokenExpires < DateTime.UtcNow)
            {
                return false;
            }

            user.PasswordHash = PasswordHelper.HashPassword(dto.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpires = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            {
                return false;
            }

            if (!PasswordHelper.VerifyPassword(dto.OldPassword, user.PasswordHash))
            {
                throw new Exception("Mật khẩu cũ không chính xác");
            }

            user.PasswordHash = PasswordHelper.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<UserDto?> GetCurrentUserAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            return _mapper.Map<UserDto>(user);
        }

        public async Task ResendVerificationEmailAsync(ResendVerificationDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null || user.IsVerified == true)
            {
                throw new Exception("Email không hợp lệ hoặc tài khoản đã được xác thực");
            }

            user.VerifyToken = Guid.NewGuid().ToString("N");
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            await _emailService.SendVerificationEmailAsync(user.Email, user.Name ?? "User", user.VerifyToken);
        }

        public async Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenDto dto)
        {
            var user = await _userRepository.GetByRefreshTokenAsync(dto.RefreshToken);
            if (user == null || user.RefreshTokenExpires < DateTime.UtcNow)
            {
                return null;
            }

            var roles = await _userRepository.GetRolesAsync(user.Id);
            var role = roles.FirstOrDefault() ?? "User";

            var response = _mapper.Map<AuthResponseDto>(user);
            response.Role = role;
            response.Token = _jwtAuthService.GenerateToken(user, role);
            response.RefreshToken = _jwtAuthService.GenerateRefreshToken();

            user.RefreshToken = response.RefreshToken;
            user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return response;
        }
    }
}
