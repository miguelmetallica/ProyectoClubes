namespace ClubesApi.Domain.Entities;

public class Zona
{
    public Guid ZonaId { get; set; }
    public Guid TorneoId { get; set; }
    public Torneo Torneo { get; set; } = null!;
    public string Nombre { get; set; } = string.Empty;

    public ICollection<Equipo> Equipos { get; set; } = new List<Equipo>();
    public ICollection<Partido> Partidos { get; set; } = new List<Partido>();
}
