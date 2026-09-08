using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record PartidoResponse(
    Guid PartidoId,
    Guid ZonaId,
    Guid EquipoLocalId,
    string EquipoLocalNombre,
    Guid EquipoVisitanteId,
    string EquipoVisitanteNombre,
    Guid? EspacioId,
    string? EspacioNombre,
    DateOnly? Fecha,
    TimeOnly? Hora,
    int? GolesLocal,
    int? GolesVisitante,
    string Estado);

public record ProgramarPartidoRequest(
    [Required] Guid EspacioId,
    [Required] DateOnly Fecha,
    [Required] TimeOnly Hora);

public record EventoRequest(
    [Required] Guid JugadorId,
    [Required] string Tipo,
    [Required] int Minuto);

public record ResultadoPartidoRequest(
    int GolesLocal,
    int GolesVisitante,
    List<EventoRequest> Eventos);

public record EventoResponse(Guid EventoId, Guid JugadorId, string JugadorNombre, string Tipo, int Minuto);
