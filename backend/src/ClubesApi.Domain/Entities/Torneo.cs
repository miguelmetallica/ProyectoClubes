using ClubesApi.Domain.Enums;

namespace ClubesApi.Domain.Entities;

public class Torneo
{
    public Guid TorneoId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public Deporte Deporte { get; set; }
    public string Categoria { get; set; } = string.Empty;

    /// <summary>Configurable, no fijo — ver docs/05-reglas-de-negocio.md.</summary>
    public SistemaCompetencia SistemaCompetencia { get; set; }

    public int PuntosVictoria { get; set; } = 3;
    public int PuntosEmpate { get; set; } = 1;
    public int PuntosDerrota { get; set; } = 0;
    public DateOnly FechaInicio { get; set; }

    public ICollection<Zona> Zonas { get; set; } = new List<Zona>();
}
