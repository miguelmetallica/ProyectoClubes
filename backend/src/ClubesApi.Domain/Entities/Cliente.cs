using ClubesApi.Domain.Enums;

namespace ClubesApi.Domain.Entities;

public class Cliente
{
    public Guid ClienteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public RolCliente Rol { get; set; } = RolCliente.Cliente;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime FechaAlta { get; set; } = DateTime.UtcNow;

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
    public ICollection<Deuda> Deudas { get; set; } = new List<Deuda>();
    public ICollection<Equipo> EquiposComoCapitan { get; set; } = new List<Equipo>();
}
