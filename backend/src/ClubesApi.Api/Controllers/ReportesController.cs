using ClubesApi.Api.Dtos;
using ClubesApi.Domain.Enums;
using ClubesApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Api.Controllers;

/// <summary>
/// Se calcula agregando Reserva + Pago + Gasto, sin entidades nuevas (ver docs/06-modelo-de-datos.md).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportesController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public ReportesController(ClubesDbContext db)
    {
        _db = db;
    }

    [HttpGet("balance")]
    public async Task<ActionResult<BalanceResponse>> GetBalance([FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta)
    {
        var desdeEfectivo = desde ?? DateOnly.FromDateTime(DateTime.UtcNow).AddMonths(-1);
        var hastaEfectivo = hasta ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var desdeDateTime = desdeEfectivo.ToDateTime(TimeOnly.MinValue);
        var hastaDateTime = hastaEfectivo.ToDateTime(TimeOnly.MaxValue);

        var ingresos = await _db.Pagos
            .Where(p => p.Estado == EstadoPago.Validado && p.FechaPago >= desdeDateTime && p.FechaPago <= hastaDateTime)
            .SumAsync(p => (decimal?)p.Monto) ?? 0m;

        var gastos = await _db.Gastos
            .Where(g => g.Fecha >= desdeEfectivo && g.Fecha <= hastaEfectivo)
            .SumAsync(g => (decimal?)g.Monto) ?? 0m;

        var deudaPendienteTotal = await _db.Deudas
            .Where(d => d.Estado == EstadoDeuda.Pendiente)
            .SumAsync(d => (decimal?)d.Monto) ?? 0m;

        return Ok(new BalanceResponse(desdeEfectivo, hastaEfectivo, ingresos, gastos, ingresos - gastos, deudaPendienteTotal));
    }

    /// <summary>Facturación, turnos confirmados y % de ocupación real por espacio, calculado contra
    /// los horarios de apertura configurados (ver ConfiguracionController).</summary>
    [HttpGet("ocupacion")]
    public async Task<ActionResult<IEnumerable<OcupacionEspacioResponse>>> GetOcupacion(
        [FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta)
    {
        var desdeEfectivo = desde ?? DateOnly.FromDateTime(DateTime.UtcNow).AddMonths(-1);
        var hastaEfectivo = hasta ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var configuracion = await _db.ConfiguracionComplejo.FirstOrDefaultAsync();
        var horaApertura = configuracion?.HoraApertura ?? new TimeOnly(8, 0);
        var horaCierre = configuracion?.HoraCierre ?? new TimeOnly(23, 0);

        var cantidadDias = hastaEfectivo.DayNumber - desdeEfectivo.DayNumber + 1;
        var horasDisponiblesTotal = (horaCierre.ToTimeSpan() - horaApertura.ToTimeSpan()).TotalHours * Math.Max(cantidadDias, 0);

        var reservas = await _db.Reservas
            .Include(r => r.Espacio)
            .Where(r => r.Estado == EstadoReserva.Confirmada && r.Fecha >= desdeEfectivo && r.Fecha <= hastaEfectivo)
            .ToListAsync();

        var resultado = reservas
            .GroupBy(r => new { r.EspacioId, r.Espacio.Nombre })
            .Select(g =>
            {
                var horasOcupadas = g.Sum(r => (r.HoraFin.ToTimeSpan() - r.HoraInicio.ToTimeSpan()).TotalHours);
                var pct = horasDisponiblesTotal > 0 ? Math.Round(horasOcupadas / horasDisponiblesTotal * 100, 1) : 0;
                return new OcupacionEspacioResponse(
                    g.Key.EspacioId, g.Key.Nombre, g.Count(), g.Sum(r => r.PrecioTotal), Math.Round(horasOcupadas, 1), pct);
            })
            .OrderByDescending(o => o.Facturacion)
            .ToList();

        return Ok(resultado);
    }

    /// <summary>Ranking de horarios pico: franjas horarias más reservadas en el rango elegido.</summary>
    [HttpGet("horarios-pico")]
    public async Task<ActionResult<IEnumerable<HorarioPicoRow>>> GetHorariosPico(
        [FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta)
    {
        var desdeEfectivo = desde ?? DateOnly.FromDateTime(DateTime.UtcNow).AddMonths(-1);
        var hastaEfectivo = hasta ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var ranking = await _db.Reservas
            .Where(r => r.Estado != EstadoReserva.Cancelada && r.Fecha >= desdeEfectivo && r.Fecha <= hastaEfectivo)
            .GroupBy(r => r.HoraInicio)
            .Select(g => new HorarioPicoRow(g.Key, g.Count()))
            .OrderByDescending(h => h.CantidadTurnos)
            .Take(10)
            .ToListAsync();

        return Ok(ranking);
    }
}
