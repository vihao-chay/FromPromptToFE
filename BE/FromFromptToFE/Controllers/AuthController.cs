using FromFromptToFE.Base;
using FromFromptToFE.DTOs.Auth;
using FromFromptToFE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FromFromptToFE.Controllers
{
    [Route("api/auth")]
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
                return ResponseEntity<object>.Ok(responseData, "Registration successful. Please verify your email.");
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
                return ResponseEntity<object>.Fail("Invalid verification code");
            }
            return ResponseEntity<object>.Ok(null, "Email verified successfully");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var response = await _authService.LoginAsync(dto);
                if (response == null)
                {
                    return ResponseEntity<AuthResponseDto>.Fail("Incorrect email or password", 401);
                }
                return ResponseEntity<AuthResponseDto>.Ok(response, "Login successful");
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
                return ResponseEntity<AuthResponseDto>.Ok(response, "Google login successful");
            }
            catch (Exception ex)
            {
                return ResponseEntity<AuthResponseDto>.Fail(ex.Message);
            }
        }

        [HttpPost("github")]
        public async Task<IActionResult> GitHubLogin([FromBody] GitHubLoginDto dto)
        {
            try
            {
                var response = await _authService.GitHubLoginAsync(dto.Code);
                return ResponseEntity<AuthResponseDto>.Ok(response, "GitHub login successful");
            }
            catch (Exception ex)
            {
                return ResponseEntity<AuthResponseDto>.Fail(ex.Message);
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                await _authService.ForgotPasswordAsync(dto);
                return ResponseEntity<object>.Ok(null, "If the email exists, a password reset link has been sent.");
            }
            catch (Exception ex)
            {
                return ResponseEntity<object>.Fail(ex.Message);
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                var response = await _authService.ResetPasswordAsync(dto);
                if (response == null)
                {
                    return ResponseEntity<object>.Fail("Invalid or expired verification code");
                }
                return ResponseEntity<AuthResponseDto>.Ok(response, "Password reset successful");
            }
            catch (Exception ex)
            {
                return ResponseEntity<object>.Fail(ex.Message);
            }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null) return Unauthorized();
                if (dto == null || string.IsNullOrWhiteSpace(dto.NewPassword))
                    return ResponseEntity<object>.Fail("New password is required", 400);

                var result = await _authService.ChangePasswordAsync(Guid.Parse(userIdClaim), dto);
                if (!result) return ResponseEntity<object>.Fail("User not found", 404);

                return ResponseEntity<object>.Ok(null, "Password changed successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<object>.Fail(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return ResponseEntity<UserDto>.Fail("Missing or invalid token (no user id in token)", 401);

                var user = await _authService.GetCurrentUserAsync(Guid.Parse(userIdClaim));
                if (user == null)
                    return ResponseEntity<UserDto>.Fail("User not found", 401);

                return ResponseEntity<UserDto>.Ok(user, "User info retrieved successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<UserDto>.Fail(ex.Message, 500);
            }
        }

        [Authorize]
        [HttpPut("me")]
        [HttpPatch("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto? dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return ResponseEntity<UserDto>.Fail("User identifier not found in token", 401);

                if (dto == null) return ResponseEntity<UserDto>.Fail("Request body is required", 400);

                if (!Guid.TryParse(userIdClaim, out var userId))
                    return ResponseEntity<UserDto>.Fail("Invalid user identifier", 401);

                var user = await _authService.UpdateProfileAsync(userId, dto);
                if (user == null) return ResponseEntity<UserDto>.Fail("User not found", 404);

                return ResponseEntity<UserDto>.Ok(user, "Profile updated successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<UserDto>.Fail(ex.Message, 500);
            }
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
        {
            try
            {
                await _authService.ResendVerificationEmailAsync(dto);
                return ResponseEntity<object>.Ok(null, "Verification email resent successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<object>.Fail(ex.Message);
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
        {
            try
            {
                var response = await _authService.RefreshTokenAsync(dto);
                if (response == null)
                {
                    return ResponseEntity<AuthResponseDto>.Fail("Refresh token is invalid or expired", 401);
                }
                return ResponseEntity<AuthResponseDto>.Ok(response, "Token refreshed successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<AuthResponseDto>.Fail(ex.Message);
            }
        }

        [Authorize]
        [HttpPost("github/link")]
        public async Task<IActionResult> LinkGitHub([FromBody] GitHubLoginDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return ResponseEntity<object>.Fail("Missing or invalid token", 401);
                if (!Guid.TryParse(userIdClaim, out var userId))
                    return ResponseEntity<object>.Fail("Invalid user identifier", 401);

                var user = await _authService.LinkGitHubAsync(userId, dto.Code);
                return ResponseEntity<UserDto>.Ok(user, "GitHub account linked successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<object>.Fail(ex.Message);
            }
        }

        [Authorize]
        [HttpDelete("github")]
        public async Task<IActionResult> DisconnectGitHub()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return ResponseEntity<object>.Fail("Missing or invalid token", 401);

                if (!Guid.TryParse(userIdClaim, out var userId))
                    return ResponseEntity<object>.Fail("Invalid user identifier", 401);

                var result = await _authService.DisconnectGitHubAsync(userId);
                if (!result)
                    return ResponseEntity<object>.Fail("GitHub account is not linked or user not found", 400);

                return ResponseEntity<object>.Ok(null, "GitHub account disconnected successfully");
            }
            catch (Exception ex)
            {
                return ResponseEntity<object>.Fail(ex.Message);
            }
        }
    }
}
