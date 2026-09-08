using ClubesApi.Api.Dtos;
using ClubesApi.Domain.Entities;
using ClubesApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Api.Controllers;

/// <summary>Gasto alimenta el balance general; no tiene relación con un cliente ni una reserva puntual.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class GastosController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public GastosController(ClubesDbContext db)
    {
        _db = db;
    }

    private static GastoResponse ToResponse(Gasto g) => new(g.GastoId, g.Concepto, g.Monto, g.Fecha);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GastoResponse>>> GetAll([FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta)
    {
        var query = _db.Gastos.AsQueryable();
        if (desde is not null) query = query.Where(g => g.Fecha >= desde);
        if (hasta is not null) query = query.Where(g => g.Fecha <= hasta);

        var gastos = await query.OrderByDescending(g => g.Fecha).ToListAsync();
        return Ok(gastos.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GastoResponse>> GetById(Guid id)
    {
        var gasto = await _db.Gastos.FindAsync(id);
        return gasto is null ? NotFound() : Ok(ToResponse(gasto));
    }

    [HttpPost]
    public async Task<ActionResult<GastoResponse>> Create(GastoRequest request)
    {
        var gasto = new Gasto
        {
            GastoId = Guid.NewGuid(),
            Concepto = request.Concepto,
            Monto = request.Monto,
            Fecha = request.Fecha
        };

        _db.Gastos.Add(gasto);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = gasto.GastoId }, ToResponse(gasto));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var gasto = await _db.Gastos.FindAsync(id);
        if (gasto is null) return NotFound();

        _db.Gastos.Remove(gasto);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
