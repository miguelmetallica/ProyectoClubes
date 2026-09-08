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
    decimal Facturacion);
