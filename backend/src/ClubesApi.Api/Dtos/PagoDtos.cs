using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record PagoRequest(
    [property: Required] Guid ReservaId,
    [property: Required] string Metodo,
    decimal Monto,
    string? ComprobanteUrl);

public record RechazarPagoRequest([property: Required] string Motivo);

// CheckoutUrl solo se completa para Mercado Pago: URL del checkout a la que redirigir al cliente.
public record PagoResponse(
    Guid PagoId,
    Guid ReservaId,
    string Metodo,
    decimal Monto,
    string Estado,
    string? ComprobanteUrl,
    DateTime FechaPago,
    Guid? ValidadoPor,
    DateTime? ValidadoEn,
    string? MotivoRechazo,
    string? CheckoutUrl = null);
