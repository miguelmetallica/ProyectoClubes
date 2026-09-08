using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClubesApi.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ClubesApi.Api.Auth;

public class JwtTokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string GenerateToken(Cliente cliente)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, cliente.ClienteId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, cliente.Email),
            new Claim(ClaimTypes.Name, cliente.Nombre),
            new Claim(ClaimTypes.Role, cliente.Rol.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.ExpiresMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
