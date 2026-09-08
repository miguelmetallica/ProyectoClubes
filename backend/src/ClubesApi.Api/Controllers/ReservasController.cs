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
public class ReservasController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public ReservasController(ClubesDbContext db)
    {
        _db = db;
    }

    private static ReservaResponse ToResponse(Reserva r) => new(
        r.ReservaId, r.ClienteId, r.EspacioId, r.Espacio.Nombre, r.Fecha, r.HoraInicio, r.HoraFin,
        r.Estado.ToString(), r.PrecioTotal, r.CanceladaEn, r.MotivoCancelacion, r.MontoReintegrado);

    /// <summary>Admin ve todas las reservas; el cliente solo ve las propias (equivalente a "Mis reservas").</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservaResponse>>> GetAll()
    {
        var query = _db.Reservas.Include(r => r.Espacio).AsQueryable();

        if (!User.IsInRole("Admin"))
        {
            var clienteId = User.GetClienteId();
            query = query.Where(r => r.ClienteId == clienteId);
        }

        var reservas = await query.OrderByDescending(r => r.Fecha).ToListAsync();
        return Ok(reservas.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReservaResponse>> GetById(Guid id)
    {
        var reserva = await _db.Reservas.Include(r => r.Espacio).SingleOrDefaultAsync(r => r.ReservaId == id);
        if (reserva is null) return NotFound();

        if (!User.IsInRole("Admin") && reserva.ClienteId != User.GetClienteId())
        {
            return Forbid();
        }

        return Ok(ToResponse(reserva));
    }

    [HttpPost]
    public async Task<ActionResult<ReservaResponse>> Create(ReservaRequest request)
    {
        var espacio = await _db.Espacios.FindAsync(request.EspacioId);
        if (espacio is null) return BadRequest("Espacio inexistente.");

        var solapada = await _db.Reservas.AnyAsync(r =>
            r.EspacioId == request.EspacioId &&
            r.Fecha == request.Fecha &&
            r.Estado != EstadoReserva.Cancelada &&
            r.HoraInicio < request.HoraFin &&
            request.HoraInicio < r.HoraFin);

        if (solapada) return Conflict("La franja horaria ya está ocupada para ese espacio.");

        var reserva = new Reserva
        {
            ReservaId = Guid.NewGuid(),
            ClienteId = User.GetClienteId(),
            EspacioId = espacio.EspacioId,
            Fecha = request.Fecha,
            HoraInicio = request.HoraInicio,
            HoraFin = request.HoraFin,
            Estado = EstadoReserva.PendientePago,
            PrecioTotal = espacio.PrecioBase,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Reservas.Add(reserva);
        await _db.SaveChangesAsync();

        reserva.Espacio = espacio;
        return CreatedAtAction(nameof(GetById), new { id = reserva.ReservaId }, ToResponse(reserva));
    }

    /// <summary>
    /// Aplica la política de cancelación configurada por espacio (ver docs/05-reglas-de-negocio.md):
    /// dentro de la ventana sin cargo se reintegra todo, fuera de la ventana se pierde la seña.
    /// </summary>
    [HttpPost("{id:guid}/cancelar")]
    public async Task<ActionResult<ReservaResponse>> Cancelar(Guid id, CancelarReservaRequest request)
    {
        var reserva = await _db.Reservas.Include(r => r.Espacio).SingleOrDefaultAsync(r => r.ReservaId == id);
        if (reserva is null) return NotFound();

        if (!User.IsInRole("Admin") && reserva.ClienteId != User.GetClienteId())
        {
            return Forbid();
        }

        if (reserva.Estado is EstadoReserva.Cancelada or EstadoReserva.NoShow)
        {
            return BadRequest("La reserva ya está cancelada o marcada como no-show.");
        }

        var horaTurno = reserva.Fecha.ToDateTime(reserva.HoraInicio);
        var dentroDeVentana = horaTurno - DateTime.Now >= TimeSpan.FromHours(reserva.Espacio.VentanaCancelacionHoras);

        reserva.Estado = EstadoReserva.Cancelada;
        reserva.CanceladaEn = DateTime.UtcNow;
        reserva.MotivoCancelacion = request.Motivo;
        reserva.MontoReintegrado = dentroDeVentana ? reserva.PrecioTotal * (reserva.Espacio.PctSena / 100m) : 0m;
        reserva.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(reserva));
    }
}
