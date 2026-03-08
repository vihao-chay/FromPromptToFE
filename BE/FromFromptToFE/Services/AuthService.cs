using AutoMapper;
using FromFromptToFE.DTOs.Auth;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Helpers;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;

namespace FromFromptToFE.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IJwtAuthService _jwtAuthService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AuthService(
            IUserRepository userRepository, 
            IMapper mapper, 
            IJwtAuthService jwtAuthService,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _jwtAuthService = jwtAuthService;
            _emailService = emailService;
            _configuration = configuration;
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

            var role = user.IsAdmin == true ? "Admin" : "User";

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

        public async Task<AuthResponseDto> GoogleLoginAsync(string token)
        {
            string debugInfo = "";
            GoogleJsonWebSignature.Payload payload = null;
            try
            {
                // 1. Try to validate as ID Token
                payload = await GoogleJsonWebSignature.ValidateAsync(token);
            }
            catch (InvalidJwtException ex)
            {
                debugInfo += $"ID Token Invalid: {ex.Message}. ";

                // 2. If ID Token validation fails, try to validate as Access Token
                try 
                {
                    using (var httpClient = new HttpClient())
                    {
                        // Use Bearer header for better compatibility
                        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
                        var userInfoResponse = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
                        
                        if (userInfoResponse.IsSuccessStatusCode)
                        {
                            var userInfoContent = await userInfoResponse.Content.ReadAsStringAsync();
                            var googleUser = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(userInfoContent);
                            
                            payload = new GoogleJsonWebSignature.Payload
                            {
                                Email = googleUser.email,
                                Name = googleUser.name,
                                Subject = googleUser.sub,
                                Picture = googleUser.picture
                            };
                        }
                        else
                        {
                            var errorContent = await userInfoResponse.Content.ReadAsStringAsync();
                            debugInfo += $"Access Token API Error: {userInfoResponse.StatusCode} - {errorContent}";
                        }
                    }
                }
                catch (Exception ex2)
                {
                   debugInfo += $"Access Token Exception: {ex2.Message}";
                }
            }

            if (payload == null)
            {
                 throw new Exception($"Token không hợp lệ. Debug: {debugInfo}");
            }

            try
            {
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

                var role = user.IsAdmin == true ? "Admin" : "User";

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
            catch (Exception ex)
            {
                throw new Exception($"Lỗi xử lý đăng nhập Google: {ex.Message}");
            }
        }

        public async Task<AuthResponseDto> GitHubLoginAsync(string code)
        {
            try
            {
                // Step 1: Exchange code for access token
                string accessToken;
                using (var httpClient = new HttpClient())
                {
                    var clientId = _configuration["GitHub:ClientId"] ?? _configuration["GITHUB_CLIENT_ID"] ?? Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID");
                    var clientSecret = _configuration["GitHub:ClientSecret"] ?? _configuration["GITHUB_CLIENT_SECRET"] ?? Environment.GetEnvironmentVariable("GITHUB_CLIENT_SECRET");

                    if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
                    {
                        throw new Exception("GitHub OAuth is not configured. Set GitHub:ClientId and GitHub:ClientSecret in appsettings.json, or set env vars GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.");
                    }

                    var redirectUri = _configuration["GitHub:RedirectUri"] ?? "http://localhost:5173/auth/github/callback";

                    var tokenRequest = new
                    {
                        client_id = clientId,
                        client_secret = clientSecret,
                        code = code,
                        redirect_uri = redirectUri
                    };

                    httpClient.DefaultRequestHeaders.Add("Accept", "application/json");

                    var tokenResponse = await httpClient.PostAsJsonAsync(
                        "https://github.com/login/oauth/access_token",
                        tokenRequest
                    );

                    var tokenContent = await tokenResponse.Content.ReadAsStringAsync();

                    if (!tokenResponse.IsSuccessStatusCode)
                    {
                        throw new Exception($"GitHub token exchange failed: {tokenResponse.StatusCode} - {tokenContent}");
                    }

                    // GitHub may return JSON (with Accept: application/json) or form-urlencoded
                    if (tokenContent.TrimStart().StartsWith("{"))
                    {
                        var json = System.Text.Json.JsonDocument.Parse(tokenContent).RootElement;
                        if (json.TryGetProperty("error", out var errEl))
                        {
                            var desc = json.TryGetProperty("error_description", out var d) ? d.GetString() : "";
                            throw new Exception($"GitHub OAuth: {errEl.GetString()} - {desc}");
                        }
                        if (!json.TryGetProperty("access_token", out var tokEl))
                            throw new Exception("Access token not found in response. " + tokenContent);
                        accessToken = tokEl.GetString() ?? throw new Exception("Access token empty");
                    }
                    else
                    {
                        var tokenParams = System.Web.HttpUtility.ParseQueryString(tokenContent);
                        var err = tokenParams["error"];
                        if (!string.IsNullOrEmpty(err))
                        {
                            var desc = tokenParams["error_description"] ?? "";
                            throw new Exception($"GitHub OAuth: {err} - {desc}");
                        }
                        accessToken = tokenParams["access_token"] ?? throw new Exception("Access token not found in response. Ensure GitHub:RedirectUri in appsettings.json matches the callback URL used in the OAuth flow (e.g. http://localhost:5173/auth/github/callback). Response: " + tokenContent);
                    }
                }

                // Step 2: Use access token to get user info (rest of the code remains the same)
                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
                    httpClient.DefaultRequestHeaders.Add("User-Agent", "FromPromptToFE");
                    
                    var userInfoResponse = await httpClient.GetAsync("https://api.github.com/user");
                    
                    if (!userInfoResponse.IsSuccessStatusCode)
                    {
                        var errorContent = await userInfoResponse.Content.ReadAsStringAsync();
                        throw new Exception($"GitHub API Error: {userInfoResponse.StatusCode} - {errorContent}");
                    }

                    var userInfoContent = await userInfoResponse.Content.ReadAsStringAsync();
                    var githubUser = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(userInfoContent);

                    string? email = githubUser.email;
                    string? name = githubUser.name ?? githubUser.login; // Use login as fallback
                    string githubId = githubUser.id.ToString();
                    string? avatarUrl = githubUser.avatar_url;

                    // If email is null, fetch from emails endpoint
                    if (string.IsNullOrEmpty(email))
                    {
                        var emailsResponse = await httpClient.GetAsync("https://api.github.com/user/emails");
                        if (emailsResponse.IsSuccessStatusCode)
                        {
                            var emailsContent = await emailsResponse.Content.ReadAsStringAsync();
                            var emails = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(emailsContent);
                            
                            // Find the primary verified email
                            foreach (var emailObj in emails)
                            {
                                if (emailObj.primary == true && emailObj.verified == true)
                                {
                                    email = emailObj.email;
                                    break;
                                }
                            }

                            // If no primary email, use the first verified one
                            if (string.IsNullOrEmpty(email))
                            {
                                foreach (var emailObj in emails)
                                {
                                    if (emailObj.verified == true)
                                    {
                                        email = emailObj.email;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (string.IsNullOrEmpty(email))
                    {
                        throw new Exception("Không thể lấy email từ GitHub. Vui lòng đảm bảo email của bạn được public hoặc cấp quyền user:email.");
                    }

                    // Find or create user
                    var user = await _userRepository.GetByEmailAsync(email);

                    if (user == null)
                    {
                        user = new User
                        {
                            Email = email,
                            Name = name,
                            GitHubId = githubId,
                            GitHubAccessToken = accessToken,
                            AvatarUrl = avatarUrl,
                            IsVerified = true,
                            Provider = "github",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        await _userRepository.AddAsync(user);
                    }
                    else if (user.GitHubId == null)
                    {
                        user.GitHubId = githubId;
                        user.GitHubAccessToken = accessToken;
                        user.AvatarUrl = avatarUrl ?? user.AvatarUrl;
                        user.UpdatedAt = DateTime.UtcNow;
                        await _userRepository.UpdateAsync(user);
                    }

                    var role = user.IsAdmin == true ? "Admin" : "User";

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
            catch (Exception ex)
            {
                throw new Exception($"Lỗi xử lý đăng nhập GitHub: {ex.Message}");
            }
        }

        public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null) return; // Bảo mật: không báo lỗi nếu email không tồn tại

            // Generate GUID Token for Link
            user.ResetToken = Guid.NewGuid().ToString("N");
            user.ResetTokenExpires = DateTime.UtcNow.AddHours(1); // Link expires in 1 hour
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            await _emailService.SendPasswordResetEmailAsync(user.Email, user.Name ?? "User", user.ResetToken);
        }

        public async Task<AuthResponseDto?> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _userRepository.GetByResetTokenAsync(dto.Token);
            if (user == null || user.ResetTokenExpires < DateTime.UtcNow)
            {
                // Invalid or expired token
                return null;
            }

            user.PasswordHash = PasswordHelper.HashPassword(dto.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpires = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            // Generate Token for Auto-Login
            var role = user.IsAdmin == true ? "Admin" : "User";

            var response = _mapper.Map<AuthResponseDto>(user);
            response.Role = role;
            response.Token = _jwtAuthService.GenerateToken(user, role);
            response.RefreshToken = _jwtAuthService.GenerateRefreshToken();
            
            user.RefreshToken = response.RefreshToken;
            user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);
            await _userRepository.UpdateAsync(user);

            return response;
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.NewPassword))
                throw new ArgumentException("New password is required");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            // No OldPassword check: allow change/set password with NewPassword only
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

        public async Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
        {
            if (dto == null) return null;
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            if (dto.Name != null) user.Name = dto.Name;
            if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
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

        public async Task<UserDto> LinkGitHubAsync(Guid userId, string code)
        {
            // Step 1: Exchange code for GitHub access token
            string accessToken;
            using (var httpClient = new HttpClient())
            {
                var clientId = _configuration["GitHub:ClientId"] ?? Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID");
                var clientSecret = _configuration["GitHub:ClientSecret"] ?? Environment.GetEnvironmentVariable("GITHUB_CLIENT_SECRET");
                var redirectUri = _configuration["GitHub:RedirectUri"] ?? "http://localhost:5173/auth/github/callback";

                if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
                    throw new Exception("GitHub OAuth is not configured.");

                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                var tokenResponse = await httpClient.PostAsJsonAsync(
                    "https://github.com/login/oauth/access_token",
                    new { client_id = clientId, client_secret = clientSecret, code, redirect_uri = redirectUri }
                );
                var tokenContent = await tokenResponse.Content.ReadAsStringAsync();

                if (tokenContent.TrimStart().StartsWith("{"))
                {
                    var json = System.Text.Json.JsonDocument.Parse(tokenContent).RootElement;
                    if (json.TryGetProperty("error", out var errEl))
                    {
                        var desc = json.TryGetProperty("error_description", out var d) ? d.GetString() : "";
                        throw new Exception($"GitHub OAuth: {errEl.GetString()} - {desc}");
                    }
                    accessToken = json.GetProperty("access_token").GetString() ?? throw new Exception("Access token empty");
                }
                else
                {
                    var tokenParams = System.Web.HttpUtility.ParseQueryString(tokenContent);
                    var err = tokenParams["error"];
                    if (!string.IsNullOrEmpty(err))
                        throw new Exception($"GitHub OAuth: {err} - {tokenParams["error_description"]}");
                    accessToken = tokenParams["access_token"] ?? throw new Exception("Access token not found");
                }
            }

            // Step 2: Get GitHub user info
            string githubId;
            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
                httpClient.DefaultRequestHeaders.Add("User-Agent", "FromPromptToFE");

                var userInfoResponse = await httpClient.GetAsync("https://api.github.com/user");
                if (!userInfoResponse.IsSuccessStatusCode)
                    throw new Exception($"GitHub API error: {userInfoResponse.StatusCode}");

                var userInfoContent = await userInfoResponse.Content.ReadAsStringAsync();
                var githubUser = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(userInfoContent)!;
                githubId = githubUser.id.ToString();

                // Ensure no other account already has this GitHubId
                var existingWithGitHub = await _userRepository.GetByGitHubIdAsync(githubId);
                if (existingWithGitHub != null && existingWithGitHub.Id != userId)
                    throw new Exception("This GitHub account is already linked to another user.");
            }

            // Step 3: Link to current user
            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new Exception("User not found");

            user.GitHubId = githubId;
            user.GitHubAccessToken = accessToken;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return _mapper.Map<UserDto>(user);
        }

        public async Task<bool> DisconnectGitHubAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (string.IsNullOrEmpty(user.GitHubId))
                return false; // Nothing to disconnect

            user.GitHubId = null;
            user.GitHubAccessToken = null;
            // If user only has GitHub as provider and has a password, switch back to local
            if (user.Provider == "github" && !string.IsNullOrEmpty(user.PasswordHash))
                user.Provider = "local";

            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenDto dto)
        {
            var user = await _userRepository.GetByRefreshTokenAsync(dto.RefreshToken);
            if (user == null || user.RefreshTokenExpires < DateTime.UtcNow)
            {
                return null;
            }

            var role = user.IsAdmin == true ? "Admin" : "User";

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
