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
public class PartidosController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public PartidosController(ClubesDbContext db)
    {
        _db = db;
    }

    private static PartidoResponse ToResponse(Partido p) => new(
        p.PartidoId, p.ZonaId, p.EquipoLocalId, p.EquipoLocal.Nombre, p.EquipoVisitanteId, p.EquipoVisitante.Nombre,
        p.EspacioId, p.Espacio?.Nombre, p.Fecha, p.Hora, p.GolesLocal, p.GolesVisitante, p.Estado.ToString());

    /// <summary>Partidos ya programados en un rango de fechas — usado por el Calendario Maestro,
    /// que comparte el mismo calendario que las reservas sueltas (docs/02-arquitectura-y-navegacion.md).</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PartidoResponse>>> GetAll([FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta)
    {
        var query = _db.Partidos
            .Include(p => p.EquipoLocal)
            .Include(p => p.EquipoVisitante)
            .Include(p => p.Espacio)
            .Where(p => p.Fecha != null);

        if (desde is not null) query = query.Where(p => p.Fecha >= desde);
        if (hasta is not null) query = query.Where(p => p.Fecha <= hasta);

        var partidos = await query.OrderBy(p => p.Fecha).ThenBy(p => p.Hora).ToListAsync();
        return Ok(partidos.Select(ToResponse));
    }

    /// <summary>Asigna espacio/fecha/hora a un partido ya generado en el fixture, ocupando el
    /// Calendario Maestro igual que una reserva suelta.</summary>
    [HttpPut("{id:guid}/programar")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PartidoResponse>> Programar(Guid id, ProgramarPartidoRequest request)
    {
        var partido = await _db.Partidos
            .Include(p => p.EquipoLocal).Include(p => p.EquipoVisitante).Include(p => p.Espacio)
            .SingleOrDefaultAsync(p => p.PartidoId == id);
        if (partido is null) return NotFound();
        if (partido.Estado == EstadoPartido.Jugado) return BadRequest("El partido ya fue jugado.");

        var espacio = await _db.Espacios.FindAsync(request.EspacioId);
        if (espacio is null) return BadRequest("Espacio inexistente.");

        var ocupadoPorReserva = await _db.Reservas.AnyAsync(r =>
            r.EspacioId == request.EspacioId && r.Fecha == request.Fecha && r.Estado != EstadoReserva.Cancelada &&
            r.HoraInicio <= request.Hora && request.Hora < r.HoraFin);

        var ocupadoPorPartido = await _db.Partidos.AnyAsync(p =>
            p.PartidoId != id && p.EspacioId == request.EspacioId && p.Fecha == request.Fecha && p.Hora == request.Hora &&
            p.Estado != EstadoPartido.Suspendido);

        if (ocupadoPorReserva || ocupadoPorPartido)
        {
            return Conflict("El espacio ya está ocupado en ese horario.");
        }

        partido.EspacioId = espacio.EspacioId;
        partido.Espacio = espacio;
        partido.Fecha = request.Fecha;
        partido.Hora = request.Hora;
        partido.Estado = EstadoPartido.Programado;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(partido));
    }

    /// <summary>
    /// Carga el marcador y los eventos (goles/asistencias/tarjetas) de un partido jugado.
    /// Al guardar, la tabla de posiciones, goleadores y tarjetas se recalculan solos — nunca se
    /// editan a mano (docs/03-flujos-clave.md). Recargar el resultado reemplaza los eventos previos.
    /// </summary>
    [HttpPost("{id:guid}/resultado")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PartidoResponse>> CargarResultado(Guid id, ResultadoPartidoRequest request)
    {
        var partido = await _db.Partidos
            .Include(p => p.EquipoLocal).Include(p => p.EquipoVisitante).Include(p => p.Espacio)
            .SingleOrDefaultAsync(p => p.PartidoId == id);
        if (partido is null) return NotFound();

        var eventos = new List<EventoPartido>();
        foreach (var ev in request.Eventos)
        {
            if (!Enum.TryParse<TipoEventoPartido>(ev.Tipo, true, out var tipo))
            {
                return BadRequest($"Tipo de evento inválido: {ev.Tipo}");
            }

            var jugadorValido = await _db.Jugadores.AnyAsync(j =>
                j.JugadorId == ev.JugadorId && (j.EquipoId == partido.EquipoLocalId || j.EquipoId == partido.EquipoVisitanteId));
            if (!jugadorValido)
            {
                return BadRequest("Un jugador del evento no pertenece a ninguno de los dos equipos del partido.");
            }

            eventos.Add(new EventoPartido { EventoId = Guid.NewGuid(), PartidoId = id, JugadorId = ev.JugadorId, Tipo = tipo, Minuto = ev.Minuto });
        }

        _db.EventosPartido.RemoveRange(_db.EventosPartido.Where(e => e.PartidoId == id));

        partido.GolesLocal = request.GolesLocal;
        partido.GolesVisitante = request.GolesVisitante;
        partido.Estado = EstadoPartido.Jugado;

        _db.EventosPartido.AddRange(eventos);
        await _db.SaveChangesAsync();

        return Ok(ToResponse(partido));
    }
}
