using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record ReservaRequest(
    [Required] Guid EspacioId,
    [Required] DateOnly Fecha,
    [Required] TimeOnly HoraInicio,
    [Required] TimeOnly HoraFin);

public record CancelarReservaRequest(string? Motivo);

public record ReservaResponse(
    Guid ReservaId,
    Guid ClienteId,
    Guid EspacioId,
    string EspacioNombre,
    DateOnly Fecha,
    TimeOnly HoraInicio,
    TimeOnly HoraFin,
    string Estado,
    decimal PrecioTotal,
    DateTime? CanceladaEn,
    string? MotivoCancelacion,
    decimal? MontoReintegrado);
