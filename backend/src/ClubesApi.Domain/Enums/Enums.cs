namespace ClubesApi.Domain.Enums;

public enum RolCliente
{
    Cliente,
    Capitan,
    Admin
}

public enum Deporte
{
    Futbol,
    Padel,
    Natacion,
    Otro
}

public enum ModalidadEspacio
{
    CanchaCompleta,
    PiletaCompleta,
    Carril
}

public enum EstadoReserva
{
    PendientePago,
    PendienteValidacion,
    Confirmada,
    Cancelada,
    NoShow
}

public enum MetodoPago
{
    MercadoPago,
    Tarjeta,
    Transferencia,
    Efectivo
}

public enum EstadoPago
{
    Pendiente,
    Validado,
    Rechazado
}

public enum SistemaCompetencia
{
    ZonasPlayoffs,
    Liga,
    EliminacionDirecta
}

public enum EstadoPartido
{
    Generado,
    Programado,
    Jugado,
    Suspendido
}

public enum TipoEventoPartido
{
    Gol,
    Asistencia,
    Amarilla,
    Roja
}

public enum EstadoDeuda
{
    Pendiente,
    Pagada
}
