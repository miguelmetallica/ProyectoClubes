using ClubesApi.Domain.Enums;

namespace ClubesApi.Domain.Entities;

public class Partido
{
    public Guid PartidoId { get; set; }
    public Guid ZonaId { get; set; }
    public Zona Zona { get; set; } = null!;
    public Guid EquipoLocalId { get; set; }
    public Equipo EquipoLocal { get; set; } = null!;
    public Guid EquipoVisitanteId { get; set; }
    public Equipo EquipoVisitante { get; set; } = null!;

    /// <summary>El partido también ocupa el Calendario Maestro, igual que las reservas sueltas.</summary>
    public Guid EspacioId { get; set; }
    public Espacio Espacio { get; set; } = null!;

    public DateOnly Fecha { get; set; }
    public TimeOnly Hora { get; set; }
    public int? GolesLocal { get; set; }
    public int? GolesVisitante { get; set; }
    public EstadoPartido Estado { get; set; } = EstadoPartido.Programado;

    public ICollection<EventoPartido> Eventos { get; set; } = new List<EventoPartido>();
}
