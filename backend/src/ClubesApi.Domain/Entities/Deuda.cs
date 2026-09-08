using ClubesApi.Domain.Enums;

namespace ClubesApi.Domain.Entities;

public class Deuda
{
    public Guid DeudaId { get; set; }
    public Guid ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;
    public string Concepto { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public DateOnly Vencimiento { get; set; }
    public EstadoDeuda Estado { get; set; } = EstadoDeuda.Pendiente;
}
