namespace ClubesApi.Domain.Entities;

/// <summary>Alimenta el balance general; no tiene relación directa con Cliente ni Reserva.</summary>
public class Gasto
{
    public Guid GastoId { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public DateOnly Fecha { get; set; }
}
