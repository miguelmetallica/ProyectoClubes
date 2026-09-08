namespace ClubesApi.Api.Dtos;

public record BalanceResponse(
    DateOnly Desde,
    DateOnly Hasta,
    decimal Ingresos,
    decimal Gastos,
    decimal Balance,
    decimal DeudaPendienteTotal);

public record OcupacionEspacioResponse(
    Guid EspacioId,
    string EspacioNombre,
    int TurnosConfirmados,
    decimal Facturacion,
    double HorasOcupadas,
    double OcupacionPct);

public record HorarioPicoRow(TimeOnly Hora, int CantidadTurnos);
