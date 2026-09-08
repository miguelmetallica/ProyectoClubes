namespace ClubesApi.Domain.Entities;

public class Jugador
{
    public Guid JugadorId { get; set; }
    public Guid EquipoId { get; set; }
    public Equipo Equipo { get; set; } = null!;
    public string Nombre { get; set; } = string.Empty;
    public int? Numero { get; set; }
    public string? Posicion { get; set; }

    public ICollection<EventoPartido> Eventos { get; set; } = new List<EventoPartido>();
}
