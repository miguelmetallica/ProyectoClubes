using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record RegisterRequest(
    [Required, MaxLength(200)] string Nombre,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password,
    string? Telefono);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public record AuthResponse(string Token, Guid ClienteId, string Nombre, string Email, string Rol);
