using ClubesApi.Domain.Enums;

namespace ClubesApi.Domain.Entities;

public class EventoPartido
{
    public Guid EventoId { get; set; }
    public Guid PartidoId { get; set; }
    public Partido Partido { get; set; } = null!;
    public Guid JugadorId { get; set; }
    public Jugador Jugador { get; set; } = null!;
    public TipoEventoPartido Tipo { get; set; }
    public int Minuto { get; set; }
}
