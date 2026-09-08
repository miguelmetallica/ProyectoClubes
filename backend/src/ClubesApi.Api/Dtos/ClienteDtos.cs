namespace ClubesApi.Api.Dtos;

public record ClienteResponse(Guid ClienteId, string Nombre, string Email, string? Telefono, string Rol, DateTime FechaAlta);
