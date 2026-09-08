using ClubesApi.Api.Dtos;
using ClubesApi.Domain.Entities;
using ClubesApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class JugadoresController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public JugadoresController(ClubesDbContext db)
    {
        _db = db;
    }

    private static JugadorResponse ToResponse(Jugador j) => new(j.JugadorId, j.EquipoId, j.Nombre, j.Numero, j.Posicion);

    [HttpGet("equipos/{equipoId:guid}/jugadores")]
    public async Task<ActionResult<IEnumerable<JugadorResponse>>> GetByEquipo(Guid equipoId)
    {
        var jugadores = await _db.Jugadores.Where(j => j.EquipoId == equipoId).ToListAsync();
        return Ok(jugadores.Select(ToResponse));
    }

    [HttpPost("equipos/{equipoId:guid}/jugadores")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<JugadorResponse>> Create(Guid equipoId, JugadorRequest request)
    {
        if (!await _db.Equipos.AnyAsync(e => e.EquipoId == equipoId))
        {
            return NotFound("Equipo inexistente.");
        }

        var jugador = new Jugador
        {
            JugadorId = Guid.NewGuid(),
            EquipoId = equipoId,
            Nombre = request.Nombre,
            Numero = request.Numero,
            Posicion = request.Posicion
        };

        _db.Jugadores.Add(jugador);
        await _db.SaveChangesAsync();

        return Ok(ToResponse(jugador));
    }

    [HttpDelete("jugadores/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var jugador = await _db.Jugadores.FindAsync(id);
        if (jugador is null) return NotFound();

        _db.Jugadores.Remove(jugador);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
