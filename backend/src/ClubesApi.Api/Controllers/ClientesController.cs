using ClubesApi.Api.Auth;
using ClubesApi.Api.Dtos;
using ClubesApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController : ControllerBase
{
    private readonly ClubesDbContext _db;

    public ClientesController(ClubesDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<ClienteResponse>>> GetAll()
    {
        var clientes = await _db.Clientes
            .Select(c => new ClienteResponse(c.ClienteId, c.Nombre, c.Email, c.Telefono, c.Rol.ToString(), c.FechaAlta))
            .ToListAsync();
        return Ok(clientes);
    }

    [HttpGet("me")]
    public async Task<ActionResult<ClienteResponse>> GetMe()
    {
        var clienteId = User.GetClienteId();
        var cliente = await _db.Clientes
            .Where(c => c.ClienteId == clienteId)
            .Select(c => new ClienteResponse(c.ClienteId, c.Nombre, c.Email, c.Telefono, c.Rol.ToString(), c.FechaAlta))
            .SingleOrDefaultAsync();

        return cliente is null ? NotFound() : Ok(cliente);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ClienteResponse>> GetById(Guid id)
    {
        var cliente = await _db.Clientes
            .Where(c => c.ClienteId == id)
            .Select(c => new ClienteResponse(c.ClienteId, c.Nombre, c.Email, c.Telefono, c.Rol.ToString(), c.FechaAlta))
            .SingleOrDefaultAsync();

        return cliente is null ? NotFound() : Ok(cliente);
    }
}
