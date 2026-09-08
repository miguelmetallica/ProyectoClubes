using ClubesApi.Domain.Enums;

namespace ClubesApi.Domain.Entities;

public class Reserva
{
    public Guid ReservaId { get; set; }
    public Guid ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;
    public Guid EspacioId { get; set; }
    public Espacio Espacio { get; set; } = null!;
    public DateOnly Fecha { get; set; }
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin { get; set; }
    public EstadoReserva Estado { get; set; } = EstadoReserva.PendientePago;
    public decimal PrecioTotal { get; set; }
    public DateTime? CanceladaEn { get; set; }
    public string? MotivoCancelacion { get; set; }
    public decimal? MontoReintegrado { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Pago? Pago { get; set; }
}
