using ClubesApi.Domain.Enums;

namespace ClubesApi.Domain.Entities;

public class Pago
{
    public Guid PagoId { get; set; }
    public Guid ReservaId { get; set; }
    public Reserva Reserva { get; set; } = null!;
    public MetodoPago Metodo { get; set; }
    public decimal Monto { get; set; }
    public EstadoPago Estado { get; set; } = EstadoPago.Pendiente;

    /// <summary>Solo aplica a transferencia.</summary>
    public string? ComprobanteUrl { get; set; }

    public DateTime FechaPago { get; set; } = DateTime.UtcNow;
    public Guid? ValidadoPor { get; set; }
    public Cliente? Validador { get; set; }
    public DateTime? ValidadoEn { get; set; }
    public string? MotivoRechazo { get; set; }
}
