namespace ClubesApi.Api.Dtos;

public record TablaPosicionesRow(
    Guid EquipoId,
    string EquipoNombre,
    int Pj,
    int G,
    int E,
    int P,
    int Gf,
    int Gc,
    int Dg,
    int Pts);

public record GoleadorRow(Guid JugadorId, string JugadorNombre, string EquipoNombre, int Goles);

public record TarjetasRow(Guid JugadorId, string JugadorNombre, string EquipoNombre, int Amarillas, int Rojas);
