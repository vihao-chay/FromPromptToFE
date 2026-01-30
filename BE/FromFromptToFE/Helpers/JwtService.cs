using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.IdentityModel.Tokens;

namespace FromFromptToFE.Helpers;

public interface IJwtAuthService
{
    string GenerateToken(User userLogin);
    string DecodePayloadToken(string token);
}

public class JwtService : IJwtAuthService
{
    private readonly string? _key;
    private readonly string? _issuer;
    private readonly string? _audience;
    // Context is not strictly needed for token generation unless we are fetching roles from DB here, 
    // but the original code did it. However, the User object passed in might already have roles if eager loaded.
    // For now, let's keep it simple and just use the config. 
    // If we need roles, we should inject IServiceProvider or the Context.
    // Looking at the original code, it was injecting EBayDbContext to get roles.
    private readonly PostgresContext _context;

    public JwtService(IConfiguration configuration, PostgresContext context)
    {
        _key = configuration["Jwt:SecretKey"]; // Adjusted key name to match Program.cs and appsettings
        _issuer = configuration["Jwt:Issuer"];
        _audience = configuration["Jwt:Audience"];
        _context = context;
    }

    public string GenerateToken(User userLogin)
    {
        var key = Encoding.ASCII.GetBytes(_key ?? throw new InvalidOperationException("Jwt SecretKey is missing"));
        
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userLogin.Id.ToString()),
            new Claim(ClaimTypes.Email, userLogin.Email ?? ""),
            new Claim(JwtRegisteredClaimNames.Sub, userLogin.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToString())
        };

        // If you have a way to get roles, add them here. 
        // Example:
        // var userRoles = _context.UserRoles.Where(ur => ur.UserId == userLogin.Id).Select(ur => ur.Role.RoleName).ToList();
        // foreach (var role in userRoles)
        // {
        //     claims.Add(new Claim(ClaimTypes.Role, role));
        // }

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature
        );

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7), // Match AuthService logic
            SigningCredentials = credentials,
            Issuer = _issuer,
            Audience = _audience,
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
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