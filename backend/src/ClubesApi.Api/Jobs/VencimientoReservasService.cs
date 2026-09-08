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
            .Include(r => r.Pagos)
            .Where(r => r.Estado == EstadoReserva.PendienteValidacion &&
                        r.Pagos.Any(p => p.Metodo == MetodoPago.Transferencia && p.Estado == EstadoPago.Pendiente) &&
                        r.Espacio.VencimientoValidacionHoras > 0)
            .ToListAsync(stoppingToken);

        var ahora = DateTime.UtcNow;
        var cantidadVencida = 0;

        foreach (var reserva in candidatas)
        {
            var pago = reserva.Pagos.Single(p => p.Metodo == MetodoPago.Transferencia && p.Estado == EstadoPago.Pendiente);
            if (pago.FechaPago.AddHours(reserva.Espacio.VencimientoValidacionHoras) > ahora)
            {
                continue;
            }

            reserva.Estado = EstadoReserva.Cancelada;
            reserva.CanceladaEn = ahora;
            reserva.MotivoCancelacion = "Vencimiento automático: comprobante de transferencia no validado a tiempo.";
            reserva.UpdatedAt = ahora;

            pago.Estado = EstadoPago.Rechazado;
            pago.MotivoRechazo = "Vencimiento automático sin validar.";
            cantidadVencida++;
        }

        if (cantidadVencida > 0)
        {
            await db.SaveChangesAsync(stoppingToken);
            _logger.LogInformation("Se vencieron automáticamente {Cantidad} reserva(s) pendientes de validación.", cantidadVencida);
        }
    }
}
