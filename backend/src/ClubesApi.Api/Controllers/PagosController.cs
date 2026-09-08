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
public class PagosController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public PagosController(ClubesDbContext db)
    {
        _db = db;
    }

    private static PagoResponse ToResponse(Pago p) => new(
        p.PagoId, p.ReservaId, p.Metodo.ToString(), p.Monto, p.Estado.ToString(),
        p.ComprobanteUrl, p.FechaPago, p.ValidadoPor, p.ValidadoEn, p.MotivoRechazo);

    /// <summary>Cola de "Validar pagos" del admin: transferencias pendientes de aprobar/rechazar.</summary>
    [HttpGet("pendientes-validacion")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<PagoResponse>>> GetPendientesValidacion()
    {
        var pagos = await _db.Pagos
            .Where(p => p.Metodo == MetodoPago.Transferencia && p.Estado == EstadoPago.Pendiente)
            .OrderBy(p => p.FechaPago)
            .ToListAsync();

        return Ok(pagos.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PagoResponse>> GetById(Guid id)
    {
        var pago = await _db.Pagos.Include(p => p.Reserva).SingleOrDefaultAsync(p => p.PagoId == id);
        if (pago is null) return NotFound();

        if (!User.IsInRole("Admin") && pago.Reserva.ClienteId != User.GetClienteId())
        {
            return Forbid();
        }

        return Ok(ToResponse(pago));
    }

    /// <summary>
    /// Registra el pago de una reserva según el medio elegido (ver docs/03-flujos-clave.md):
    /// Mercado Pago/tarjeta confirman al instante, transferencia queda pendiente de validación,
    /// efectivo queda pendiente hasta que el cliente llega al club.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PagoResponse>> Create(PagoRequest request)
    {
        if (!Enum.TryParse<MetodoPago>(request.Metodo, true, out var metodo))
        {
            return BadRequest("Método de pago inválido.");
        }

        var reserva = await _db.Reservas.SingleOrDefaultAsync(r => r.ReservaId == request.ReservaId);
        if (reserva is null) return BadRequest("Reserva inexistente.");

        if (!User.IsInRole("Admin") && reserva.ClienteId != User.GetClienteId())
        {
            return Forbid();
        }

        if (metodo == MetodoPago.Transferencia && string.IsNullOrWhiteSpace(request.ComprobanteUrl))
        {
            return BadRequest("La transferencia requiere adjuntar comprobante.");
        }

        var pago = new Pago
        {
            PagoId = Guid.NewGuid(),
            ReservaId = reserva.ReservaId,
            Metodo = metodo,
            Monto = request.Monto,
            ComprobanteUrl = request.ComprobanteUrl,
            FechaPago = DateTime.UtcNow,
            Estado = metodo == MetodoPago.Transferencia ? EstadoPago.Pendiente : EstadoPago.Validado
        };

        reserva.Estado = metodo switch
        {
            MetodoPago.Transferencia => EstadoReserva.PendienteValidacion,
            MetodoPago.Efectivo => EstadoReserva.PendientePago,
            _ => EstadoReserva.Confirmada
        };
        reserva.UpdatedAt = DateTime.UtcNow;

        _db.Pagos.Add(pago);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = pago.PagoId }, ToResponse(pago));
    }

    [HttpPost("{id:guid}/aprobar")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagoResponse>> Aprobar(Guid id)
    {
        var pago = await _db.Pagos.Include(p => p.Reserva).SingleOrDefaultAsync(p => p.PagoId == id);
        if (pago is null) return NotFound();
        if (pago.Metodo != MetodoPago.Transferencia) return BadRequest("Solo aplica a pagos por transferencia.");

        pago.Estado = EstadoPago.Validado;
        pago.ValidadoPor = User.GetClienteId();
        pago.ValidadoEn = DateTime.UtcNow;
        pago.Reserva.Estado = EstadoReserva.Confirmada;
        pago.Reserva.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(pago));
    }

    [HttpPost("{id:guid}/rechazar")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagoResponse>> Rechazar(Guid id, RechazarPagoRequest request)
    {
        var pago = await _db.Pagos.Include(p => p.Reserva).SingleOrDefaultAsync(p => p.PagoId == id);
        if (pago is null) return NotFound();
        if (pago.Metodo != MetodoPago.Transferencia) return BadRequest("Solo aplica a pagos por transferencia.");

        pago.Estado = EstadoPago.Rechazado;
        pago.ValidadoPor = User.GetClienteId();
        pago.ValidadoEn = DateTime.UtcNow;
        pago.MotivoRechazo = request.Motivo;
        pago.Reserva.Estado = EstadoReserva.PendientePago;
        pago.Reserva.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(pago));
    }
}
