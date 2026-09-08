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
public class TorneosController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public TorneosController(ClubesDbContext db)
    {
        _db = db;
    }

    private static TorneoResponse ToResponse(Torneo t, Guid zonaId) => new(
        t.TorneoId, t.Nombre, t.Deporte.ToString(), t.Categoria, t.SistemaCompetencia.ToString(),
        t.PuntosVictoria, t.PuntosEmpate, t.PuntosDerrota, t.FechaInicio, zonaId);

    private static EquipoResponse ToResponse(Equipo e) => new(
        e.EquipoId, e.ZonaId, e.Nombre, e.CapitanId, e.Capitan?.Nombre, e.Jugadores.Count);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TorneoResponse>>> GetAll()
    {
        var torneos = await _db.Torneos.Include(t => t.Zonas).ToListAsync();
        return Ok(torneos.Select(t => ToResponse(t, t.Zonas.First().ZonaId)));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TorneoResponse>> GetById(Guid id)
    {
        var torneo = await _db.Torneos.Include(t => t.Zonas).SingleOrDefaultAsync(t => t.TorneoId == id);
        return torneo is null ? NotFound() : Ok(ToResponse(torneo, torneo.Zonas.First().ZonaId));
    }

    /// <summary>Crea el torneo con una única zona ("Zona Única"): alcanza para Liga, que usa una tabla
    /// única. Zonas + playoffs necesitaría múltiples zonas, todavía no soportado en la creación.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TorneoResponse>> Create(TorneoRequest request)
    {
        if (!Enum.TryParse<Deporte>(request.Deporte, true, out var deporte) ||
            !Enum.TryParse<SistemaCompetencia>(request.SistemaCompetencia, true, out var sistema))
        {
            return BadRequest("Deporte o sistema de competencia inválidos.");
        }

        var torneo = new Torneo
        {
            TorneoId = Guid.NewGuid(),
            Nombre = request.Nombre,
            Deporte = deporte,
            Categoria = request.Categoria,
            SistemaCompetencia = sistema,
            PuntosVictoria = request.PuntosVictoria,
            PuntosEmpate = request.PuntosEmpate,
            PuntosDerrota = request.PuntosDerrota,
            FechaInicio = request.FechaInicio
        };

        var zona = new Zona { ZonaId = Guid.NewGuid(), TorneoId = torneo.TorneoId, Nombre = "Zona Única" };

        _db.Torneos.Add(torneo);
        _db.Zonas.Add(zona);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = torneo.TorneoId }, ToResponse(torneo, zona.ZonaId));
    }

    [HttpGet("{id:guid}/equipos")]
    public async Task<ActionResult<IEnumerable<EquipoResponse>>> GetEquipos(Guid id)
    {
        var equipos = await _db.Equipos
            .Include(e => e.Capitan)
            .Include(e => e.Jugadores)
            .Where(e => e.Zona.TorneoId == id)
            .ToListAsync();

        return Ok(equipos.Select(ToResponse));
    }

    [HttpPost("{id:guid}/equipos")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EquipoResponse>> CrearEquipo(Guid id, EquipoRequest request)
    {
        var zona = await _db.Zonas.SingleOrDefaultAsync(z => z.TorneoId == id);
        if (zona is null) return NotFound("Torneo inexistente.");

        if (request.CapitanId is not null && !await _db.Clientes.AnyAsync(c => c.ClienteId == request.CapitanId))
        {
            return BadRequest("El capitán indicado no existe.");
        }

        var equipo = new Equipo
        {
            EquipoId = Guid.NewGuid(),
            ZonaId = zona.ZonaId,
            Nombre = request.Nombre,
            CapitanId = request.CapitanId
        };

        _db.Equipos.Add(equipo);
        await _db.SaveChangesAsync();

        return Ok(ToResponse(equipo));
    }

    /// <summary>
    /// Genera el fixture de todos contra todos (round-robin) entre los equipos ya cargados.
    /// Solo implementado para Liga; zonas + playoffs y eliminación directa quedan pendientes.
    /// </summary>
    [HttpPost("{id:guid}/generar-fixture")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<PartidoResponse>>> GenerarFixture(Guid id)
    {
        var torneo = await _db.Torneos.Include(t => t.Zonas).ThenInclude(z => z.Equipos)
            .SingleOrDefaultAsync(t => t.TorneoId == id);
        if (torneo is null) return NotFound("Torneo inexistente.");

        if (torneo.SistemaCompetencia != SistemaCompetencia.Liga)
        {
            return BadRequest("La generación automática de fixture todavía solo está implementada para Liga.");
        }

        var zona = torneo.Zonas.First();

        if (await _db.Partidos.AnyAsync(p => p.ZonaId == zona.ZonaId))
        {
            return Conflict("El fixture de este torneo ya fue generado.");
        }

        var equipos = zona.Equipos.ToList();
        if (equipos.Count < 2)
        {
            return BadRequest("Hacen falta al menos 2 equipos para generar el fixture.");
        }

        var partidos = new List<Partido>();
        var respuestas = new List<PartidoResponse>();
        for (var i = 0; i < equipos.Count; i++)
        {
            for (var j = i + 1; j < equipos.Count; j++)
            {
                var partido = new Partido
                {
                    PartidoId = Guid.NewGuid(),
                    ZonaId = zona.ZonaId,
                    EquipoLocalId = equipos[i].EquipoId,
                    EquipoVisitanteId = equipos[j].EquipoId,
                    Estado = EstadoPartido.Generado
                };
                partidos.Add(partido);
                respuestas.Add(new PartidoResponse(
                    partido.PartidoId, zona.ZonaId, equipos[i].EquipoId, equipos[i].Nombre,
                    equipos[j].EquipoId, equipos[j].Nombre,
                    null, null, null, null, null, null, partido.Estado.ToString()));
            }
        }

        _db.Partidos.AddRange(partidos);
        await _db.SaveChangesAsync();

        return Ok(respuestas);
    }

    [HttpGet("{id:guid}/fixture")]
    public async Task<ActionResult<IEnumerable<PartidoResponse>>> GetFixture(Guid id)
    {
        var partidos = await _db.Partidos
            .Include(p => p.EquipoLocal)
            .Include(p => p.EquipoVisitante)
            .Include(p => p.Espacio)
            .Where(p => p.Zona.TorneoId == id)
            .OrderBy(p => p.Fecha)
            .ThenBy(p => p.Hora)
            .ToListAsync();

        return Ok(partidos.Select(p => new PartidoResponse(
            p.PartidoId, p.ZonaId, p.EquipoLocalId, p.EquipoLocal.Nombre, p.EquipoVisitanteId, p.EquipoVisitante.Nombre,
            p.EspacioId, p.Espacio?.Nombre, p.Fecha, p.Hora, p.GolesLocal, p.GolesVisitante, p.Estado.ToString())));
    }

    /// <summary>Tabla de posiciones calculada sobre Partido — nunca se edita a mano (docs/03-flujos-clave.md).</summary>
    [HttpGet("{id:guid}/tabla")]
    public async Task<ActionResult<IEnumerable<TablaPosicionesRow>>> GetTabla(Guid id)
    {
        var torneo = await _db.Torneos.SingleOrDefaultAsync(t => t.TorneoId == id);
        if (torneo is null) return NotFound();

        var equipos = await _db.Equipos.Where(e => e.Zona.TorneoId == id).ToListAsync();
        var jugados = await _db.Partidos
            .Where(p => p.Zona.TorneoId == id && p.Estado == EstadoPartido.Jugado)
            .ToListAsync();

        var tabla = equipos.Select(equipo =>
        {
            var comoLocal = jugados.Where(p => p.EquipoLocalId == equipo.EquipoId).ToList();
            var comoVisitante = jugados.Where(p => p.EquipoVisitanteId == equipo.EquipoId).ToList();

            int pj = comoLocal.Count + comoVisitante.Count;
            int g = comoLocal.Count(p => p.GolesLocal > p.GolesVisitante) + comoVisitante.Count(p => p.GolesVisitante > p.GolesLocal);
            int e = comoLocal.Count(p => p.GolesLocal == p.GolesVisitante) + comoVisitante.Count(p => p.GolesLocal == p.GolesVisitante);
            int p = pj - g - e;
            int gf = comoLocal.Sum(x => x.GolesLocal ?? 0) + comoVisitante.Sum(x => x.GolesVisitante ?? 0);
            int gc = comoLocal.Sum(x => x.GolesVisitante ?? 0) + comoVisitante.Sum(x => x.GolesLocal ?? 0);
            int pts = g * torneo.PuntosVictoria + e * torneo.PuntosEmpate + p * torneo.PuntosDerrota;

            return new TablaPosicionesRow(equipo.EquipoId, equipo.Nombre, pj, g, e, p, gf, gc, gf - gc, pts);
        })
        .OrderByDescending(r => r.Pts)
        .ThenByDescending(r => r.Dg)
        .ThenByDescending(r => r.Gf)
        .ToList();

        return Ok(tabla);
    }

    [HttpGet("{id:guid}/goleadores")]
    public async Task<ActionResult<IEnumerable<GoleadorRow>>> GetGoleadores(Guid id)
    {
        var goleadores = await _db.EventosPartido
            .Where(ev => ev.Partido.Zona.TorneoId == id && ev.Tipo == TipoEventoPartido.Gol)
            .GroupBy(ev => new { ev.JugadorId, ev.Jugador.Nombre, EquipoNombre = ev.Jugador.Equipo.Nombre })
            .Select(g => new GoleadorRow(g.Key.JugadorId, g.Key.Nombre, g.Key.EquipoNombre, g.Count()))
            .OrderByDescending(g => g.Goles)
            .ToListAsync();

        return Ok(goleadores);
    }

    [HttpGet("{id:guid}/tarjetas")]
    public async Task<ActionResult<IEnumerable<TarjetasRow>>> GetTarjetas(Guid id)
    {
        var eventos = await _db.EventosPartido
            .Where(ev => ev.Partido.Zona.TorneoId == id && (ev.Tipo == TipoEventoPartido.Amarilla || ev.Tipo == TipoEventoPartido.Roja))
            .Select(ev => new { ev.JugadorId, ev.Jugador.Nombre, EquipoNombre = ev.Jugador.Equipo.Nombre, ev.Tipo })
            .ToListAsync();

        var tarjetas = eventos
            .GroupBy(ev => new { ev.JugadorId, ev.Nombre, ev.EquipoNombre })
            .Select(g => new TarjetasRow(
                g.Key.JugadorId, g.Key.Nombre, g.Key.EquipoNombre,
                g.Count(x => x.Tipo == TipoEventoPartido.Amarilla),
                g.Count(x => x.Tipo == TipoEventoPartido.Roja)))
            .OrderByDescending(t => t.Rojas).ThenByDescending(t => t.Amarillas)
            .ToList();

        return Ok(tarjetas);
    }
}
