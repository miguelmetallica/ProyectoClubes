using ClubesApi.Api.Auth;
using ClubesApi.Api.Dtos;
using ClubesApi.Domain.Entities;
using ClubesApi.Domain.Enums;
using ClubesApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DeudasController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public DeudasController(ClubesDbContext db)
    {
        _db = db;
    }

    private static DeudaResponse ToResponse(Deuda d) =>
        new(d.DeudaId, d.ClienteId, d.Concepto, d.Monto, d.Vencimiento, d.Estado.ToString());

    /// <summary>Admin ve las deudas de todos los clientes (opcionalmente filtradas); el cliente solo ve las propias.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DeudaResponse>>> GetAll([FromQuery] Guid? clienteId)
    {
        var query = _db.Deudas.AsQueryable();

        if (!User.IsInRole("Admin"))
        {
            query = query.Where(d => d.ClienteId == User.GetClienteId());
        }
        else if (clienteId is not null)
        {
            query = query.Where(d => d.ClienteId == clienteId);
        }

        var deudas = await query.OrderBy(d => d.Vencimiento).ToListAsync();
        return Ok(deudas.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DeudaResponse>> GetById(Guid id)
    {
        var deuda = await _db.Deudas.FindAsync(id);
        if (deuda is null) return NotFound();

        if (!User.IsInRole("Admin") && deuda.ClienteId != User.GetClienteId())
        {
            return Forbid();
        }

        return Ok(ToResponse(deuda));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<DeudaResponse>> Create(DeudaRequest request)
    {
        if (!await _db.Clientes.AnyAsync(c => c.ClienteId == request.ClienteId))
        {
            return BadRequest("Cliente inexistente.");
        }

        var deuda = new Deuda
        {
            DeudaId = Guid.NewGuid(),
            ClienteId = request.ClienteId,
            Concepto = request.Concepto,
            Monto = request.Monto,
            Vencimiento = request.Vencimiento,
            Estado = EstadoDeuda.Pendiente
        };

        _db.Deudas.Add(deuda);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = deuda.DeudaId }, ToResponse(deuda));
    }

    [HttpPost("{id:guid}/marcar-pagada")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<DeudaResponse>> MarcarPagada(Guid id)
    {
        var deuda = await _db.Deudas.FindAsync(id);
        if (deuda is null) return NotFound();

        deuda.Estado = EstadoDeuda.Pagada;
        await _db.SaveChangesAsync();

        return Ok(ToResponse(deuda));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deuda = await _db.Deudas.FindAsync(id);
        if (deuda is null) return NotFound();

        _db.Deudas.Remove(deuda);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
