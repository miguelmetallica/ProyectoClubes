using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record DeudaRequest(
    [Required] Guid ClienteId,
    [Required, MaxLength(200)] string Concepto,
    decimal Monto,
    DateOnly Vencimiento);

public record DeudaResponse(
    Guid DeudaId,
    Guid ClienteId,
    string Concepto,
    decimal Monto,
    DateOnly Vencimiento,
    string Estado);
