using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ClubesApi.Api.Auth;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetClienteId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? throw new InvalidOperationException("El token no contiene el claim 'sub'.");
        return Guid.Parse(value);
    }
}
