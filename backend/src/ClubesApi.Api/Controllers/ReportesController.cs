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

    /// <summary>Facturación y turnos confirmados por espacio. El % de ocupación real requiere modelar
    /// los horarios de apertura del complejo (Configuración), que todavía no está en el modelo de datos.</summary>
    [HttpGet("ocupacion")]
    public async Task<ActionResult<IEnumerable<OcupacionEspacioResponse>>> GetOcupacion(
        [FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta)
    {
        var desdeEfectivo = desde ?? DateOnly.FromDateTime(DateTime.UtcNow).AddMonths(-1);
        var hastaEfectivo = hasta ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var resultado = await _db.Reservas
            .Where(r => r.Estado == EstadoReserva.Confirmada && r.Fecha >= desdeEfectivo && r.Fecha <= hastaEfectivo)
            .GroupBy(r => new { r.EspacioId, r.Espacio.Nombre })
            .Select(g => new OcupacionEspacioResponse(g.Key.EspacioId, g.Key.Nombre, g.Count(), g.Sum(r => r.PrecioTotal)))
            .OrderByDescending(o => o.Facturacion)
            .ToListAsync();

        return Ok(resultado);
    }
}
