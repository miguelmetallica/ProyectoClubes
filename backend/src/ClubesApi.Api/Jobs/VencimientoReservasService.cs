using ClubesApi.Domain.Enums;
using ClubesApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Api.Jobs;

/// <summary>
/// Resuelve el "Punto a evaluar" de docs/05-reglas-de-negocio.md: si nadie valida una
/// transferencia a tiempo, libera el turno automáticamente en lugar de dejarlo "tomado"
/// indefinidamente. El vencimiento es configurable por espacio (0 = sin vencimiento
/// automático), igual criterio que la ventana de cancelación.
/// </summary>
public class VencimientoReservasService : BackgroundService
{
    private static readonly TimeSpan Intervalo = TimeSpan.FromMinutes(15);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<VencimientoReservasService> _logger;

    public VencimientoReservasService(IServiceScopeFactory scopeFactory, ILogger<VencimientoReservasService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await VencerReservasPendientesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar el vencimiento automático de reservas pendientes de validación.");
            }

            await Task.Delay(Intervalo, stoppingToken);
        }
    }

    private async Task VencerReservasPendientesAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ClubesDbContext>();

        var candidatas = await db.Reservas
            .Include(r => r.Espacio)
            .Include(r => r.Pago)
            .Where(r => r.Estado == EstadoReserva.PendienteValidacion &&
                        r.Pago != null && r.Pago.Metodo == MetodoPago.Transferencia && r.Pago.Estado == EstadoPago.Pendiente &&
                        r.Espacio.VencimientoValidacionHoras > 0)
            .ToListAsync(stoppingToken);

        var ahora = DateTime.UtcNow;
        var vencidas = candidatas.Where(r => r.Pago!.FechaPago.AddHours(r.Espacio.VencimientoValidacionHoras) <= ahora).ToList();

        foreach (var reserva in vencidas)
        {
            reserva.Estado = EstadoReserva.Cancelada;
            reserva.CanceladaEn = ahora;
            reserva.MotivoCancelacion = "Vencimiento automático: comprobante de transferencia no validado a tiempo.";
            reserva.UpdatedAt = ahora;

            reserva.Pago!.Estado = EstadoPago.Rechazado;
            reserva.Pago.MotivoRechazo = "Vencimiento automático sin validar.";
        }

        if (vencidas.Count > 0)
        {
            await db.SaveChangesAsync(stoppingToken);
            _logger.LogInformation("Se vencieron automáticamente {Cantidad} reserva(s) pendientes de validación.", vencidas.Count);
        }
    }
}
