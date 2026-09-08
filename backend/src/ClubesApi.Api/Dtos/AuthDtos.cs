using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record RegisterRequest(
    [property: Required, MaxLength(200)] string Nombre,
    [property: Required, EmailAddress] string Email,
    [property: Required, MinLength(8)] string Password,
    string? Telefono);

public record LoginRequest(
    [property: Required, EmailAddress] string Email,
    [property: Required] string Password);

public record AuthResponse(string Token, Guid ClienteId, string Nombre, string Email, string Rol);
