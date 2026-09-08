using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record ReservaRequest(
    [property: Required] Guid EspacioId,
    [property: Required] DateOnly Fecha,
    [property: Required] TimeOnly HoraInicio,
    [property: Required] TimeOnly HoraFin);

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
