using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record GastoRequest(
    [Required, MaxLength(200)] string Concepto,
    decimal Monto,
    DateOnly Fecha);

public record GastoResponse(Guid GastoId, string Concepto, decimal Monto, DateOnly Fecha);
