namespace ClubesApi.Domain.Entities;

/// <summary>
/// Fila única de configuración general del complejo (horarios de apertura), usada para
/// calcular el % de ocupación real en Reportes. No modela horarios distintos por día
/// de la semana — no se pidió esa granularidad y agregarla ahora sería prematuro.
/// </summary>
public class ConfiguracionComplejo
{
    public Guid ConfiguracionId { get; set; }
    public TimeOnly HoraApertura { get; set; } = new(8, 0);
    public TimeOnly HoraCierre { get; set; } = new(23, 0);
}
