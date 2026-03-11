using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.IdentityModel.Tokens;

namespace FromFromptToFE.Helpers;

public interface IJwtAuthService
{
    string GenerateToken(User userLogin, string role);
    string DecodePayloadToken(string token);
    string GenerateRefreshToken();
}

public class JwtService : IJwtAuthService
{
    private readonly string? _key;
    private readonly string? _issuer;
    private readonly string? _audience;
    private readonly PostgresContext _context;

    public JwtService(IConfiguration configuration, PostgresContext context)
    {
        var secret = configuration["Jwt:SecretKey"];
        _key = string.IsNullOrWhiteSpace(secret) ? "FromPromptToFE-Dev-Jwt-SecretKey-Min32CharsRequired!!" : secret;
        _issuer = configuration["Jwt:Issuer"] ?? "FromPromptToFE";
        _audience = configuration["Jwt:Audience"] ?? "FromPromptToFE";
        _context = context;
    }

    public string GenerateToken(User userLogin, string role)
    {
        var key = Encoding.ASCII.GetBytes(_key ?? throw new InvalidOperationException("Jwt SecretKey is missing"));
        
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userLogin.Id.ToString()),
            new Claim(ClaimTypes.Email, userLogin.Email ?? ""),
            new Claim(ClaimTypes.Role, role), // Thêm Role vào đây
            new Claim(JwtRegisteredClaimNames.Sub, userLogin.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature
        );

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1), // Shorter expiration for access token
            SigningCredentials = credentials,
            Issuer = _issuer,
            Audience = _audience,
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
    }

    public string DecodePayloadToken(string token)
    {
        try
        {
            if (string.IsNullOrEmpty(token))
            {
                throw new ArgumentException("Token cannot be empty", nameof(token));
            }

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            var usernameClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Sub) 
                                ?? jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);

            if (usernameClaim == null)
            {
                throw new InvalidOperationException("Cannot find subject/username in token payload");
            }

            return usernameClaim.Value;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Error decoding token: {ex.Message}", ex);
        }
    }
}