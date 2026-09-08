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
public class EspaciosController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public EspaciosController(ClubesDbContext db)
    {
        _db = db;
    }

    private static EspacioResponse ToResponse(Espacio e) => new(
        e.EspacioId, e.Nombre, e.Deporte.ToString(), e.Modalidad.ToString(),
        e.PrecioBase, e.PctSena, e.VentanaCancelacionHoras, e.VencimientoValidacionHoras);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EspacioResponse>>> GetAll()
    {
        var espacios = await _db.Espacios.ToListAsync();
        return Ok(espacios.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EspacioResponse>> GetById(Guid id)
    {
        var espacio = await _db.Espacios.FindAsync(id);
        return espacio is null ? NotFound() : Ok(ToResponse(espacio));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EspacioResponse>> Create(EspacioRequest request)
    {
        if (!Enum.TryParse<Deporte>(request.Deporte, true, out var deporte) ||
            !Enum.TryParse<ModalidadEspacio>(request.Modalidad, true, out var modalidad))
        {
            return BadRequest("Deporte o modalidad inválidos.");
        }

        var espacio = new Espacio
        {
            EspacioId = Guid.NewGuid(),
            Nombre = request.Nombre,
            Deporte = deporte,
            Modalidad = modalidad,
            PrecioBase = request.PrecioBase,
            PctSena = request.PctSena,
            VentanaCancelacionHoras = request.VentanaCancelacionHoras,
            VencimientoValidacionHoras = request.VencimientoValidacionHoras
        };

        _db.Espacios.Add(espacio);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = espacio.EspacioId }, ToResponse(espacio));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, EspacioRequest request)
    {
        var espacio = await _db.Espacios.FindAsync(id);
        if (espacio is null) return NotFound();

        if (!Enum.TryParse<Deporte>(request.Deporte, true, out var deporte) ||
            !Enum.TryParse<ModalidadEspacio>(request.Modalidad, true, out var modalidad))
        {
            return BadRequest("Deporte o modalidad inválidos.");
        }

        espacio.Nombre = request.Nombre;
        espacio.Deporte = deporte;
        espacio.Modalidad = modalidad;
        espacio.PrecioBase = request.PrecioBase;
        espacio.PctSena = request.PctSena;
        espacio.VentanaCancelacionHoras = request.VentanaCancelacionHoras;
        espacio.VencimientoValidacionHoras = request.VencimientoValidacionHoras;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var espacio = await _db.Espacios.FindAsync(id);
        if (espacio is null) return NotFound();

        _db.Espacios.Remove(espacio);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
