using ClubesApi.Api.Dtos;
using ClubesApi.Domain.Entities;
using ClubesApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Api.Controllers;

/// <summary>Configuración general del complejo (horarios de apertura), usada para calcular
/// el % de ocupación real en Reportes. Es una fila única, creada con valores por defecto
/// la primera vez que se consulta.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConfiguracionController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public ConfiguracionController(ClubesDbContext db)
    {
        _db = db;
    }

    private async Task<ConfiguracionComplejo> ObtenerOCrearAsync()
    {
        var configuracion = await _db.ConfiguracionComplejo.FirstOrDefaultAsync();
        if (configuracion is null)
        {
            configuracion = new ConfiguracionComplejo { ConfiguracionId = Guid.NewGuid() };
            _db.ConfiguracionComplejo.Add(configuracion);
            await _db.SaveChangesAsync();
        }

        return configuracion;
    }

    [HttpGet]
    public async Task<ActionResult<ConfiguracionResponse>> Get()
    {
        var configuracion = await ObtenerOCrearAsync();
        return Ok(new ConfiguracionResponse(configuracion.HoraApertura, configuracion.HoraCierre));
    }

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ConfiguracionResponse>> Update(ConfiguracionRequest request)
    {
        if (request.HoraCierre <= request.HoraApertura)
        {
            return BadRequest("La hora de cierre debe ser posterior a la hora de apertura.");
        }

        var configuracion = await ObtenerOCrearAsync();
        configuracion.HoraApertura = request.HoraApertura;
        configuracion.HoraCierre = request.HoraCierre;
        await _db.SaveChangesAsync();

        return Ok(new ConfiguracionResponse(configuracion.HoraApertura, configuracion.HoraCierre));
    }
}
