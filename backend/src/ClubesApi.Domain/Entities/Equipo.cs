namespace ClubesApi.Domain.Entities;

public class Equipo
{
    public Guid EquipoId { get; set; }
    public Guid ZonaId { get; set; }
    public Zona Zona { get; set; } = null!;
    public string Nombre { get; set; } = string.Empty;
    public Guid? CapitanId { get; set; }
    public Cliente? Capitan { get; set; }

    public ICollection<Jugador> Jugadores { get; set; } = new List<Jugador>();
    public ICollection<Partido> PartidosComoLocal { get; set; } = new List<Partido>();
    public ICollection<Partido> PartidosComoVisitante { get; set; } = new List<Partido>();
}
