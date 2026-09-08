using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record EquipoRequest([Required, MaxLength(200)] string Nombre, Guid? CapitanId);

public record EquipoResponse(
    Guid EquipoId,
    Guid ZonaId,
    string Nombre,
    Guid? CapitanId,
    string? CapitanNombre,
    int CantidadJugadores);
