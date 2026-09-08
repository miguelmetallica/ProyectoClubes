using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record TorneoRequest(
    [Required, MaxLength(200)] string Nombre,
    [Required] string Deporte,
    [Required, MaxLength(100)] string Categoria,
    [Required] string SistemaCompetencia,
    int PuntosVictoria,
    int PuntosEmpate,
    int PuntosDerrota,
    DateOnly FechaInicio);

public record TorneoResponse(
    Guid TorneoId,
    string Nombre,
    string Deporte,
    string Categoria,
    string SistemaCompetencia,
    int PuntosVictoria,
    int PuntosEmpate,
    int PuntosDerrota,
    DateOnly FechaInicio,
    Guid ZonaId);
