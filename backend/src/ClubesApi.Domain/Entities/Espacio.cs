using ClubesApi.Domain.Enums;

namespace ClubesApi.Domain.Entities;

public class Espacio
{
    public Guid EspacioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public Deporte Deporte { get; set; }
    public ModalidadEspacio Modalidad { get; set; }
    public decimal PrecioBase { get; set; }

    /// <summary>Configurable por espacio, no global — ver docs/05-reglas-de-negocio.md.</summary>
    public decimal PctSena { get; set; }

    /// <summary>Configurable por espacio, no global — ver docs/05-reglas-de-negocio.md.</summary>
    public int VentanaCancelacionHoras { get; set; }

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
    public ICollection<Partido> Partidos { get; set; } = new List<Partido>();
}
