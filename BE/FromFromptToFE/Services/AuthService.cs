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

            var response = _mapper.Map<AuthResponseDto>(user);
            response.Token = _jwtAuthService.GenerateToken(user);
            
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

                var response = _mapper.Map<AuthResponseDto>(user);
                response.Token = _jwtAuthService.GenerateToken(user);
                return response;
            }
            catch (InvalidJwtException)
            {
                throw new Exception("Token Google không hợp lệ");
            }
        }
    }
}
