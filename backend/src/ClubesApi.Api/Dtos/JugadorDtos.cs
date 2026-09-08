using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record JugadorRequest([property: Required, MaxLength(200)] string Nombre, int? Numero, string? Posicion);

public record JugadorResponse(Guid JugadorId, Guid EquipoId, string Nombre, int? Numero, string? Posicion);
