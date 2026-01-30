using FromFromptToFE.Base;
using FromFromptToFE.DTOs.Auth;
using FromFromptToFE.Services;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers
{
    [Route("auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var user = await _authService.RegisterAsync(dto);
                var responseData = new { verifyToken = user.VerifyToken };
                return ResponseEntity<object>.Ok(responseData, "Đăng ký thành công. Vui lòng xác thực email của bạn.");
            }
            catch (Exception ex)
            {
                return ResponseEntity<object>.Fail(ex.Message);
            }
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
        {
            var result = await _authService.VerifyEmailAsync(dto.Token);
            if (!result)
            {
                return ResponseEntity<object>.Fail("Mã xác thực không hợp lệ");
            }
            return ResponseEntity<object>.Ok(null, "Xác thực email thành công");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var response = await _authService.LoginAsync(dto);
                if (response == null)
                {
                    return ResponseEntity<AuthResponseDto>.Fail("Email hoặc mật khẩu không chính xác", 401);
                }
                return ResponseEntity<AuthResponseDto>.Ok(response, "Đăng nhập thành công");
            }
            catch (Exception ex)
            {
                return ResponseEntity<AuthResponseDto>.Fail(ex.Message);
            }
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            try
            {
                var response = await _authService.GoogleLoginAsync(dto.IdToken);
                return ResponseEntity<AuthResponseDto>.Ok(response, "Đăng nhập Google thành công");
            }
            catch (Exception ex)
            {
                return ResponseEntity<AuthResponseDto>.Fail(ex.Message);
            }
        }
    }
}
