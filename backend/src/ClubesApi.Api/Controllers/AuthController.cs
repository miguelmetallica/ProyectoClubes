using ClubesApi.Api.Auth;
using ClubesApi.Api.Dtos;
using ClubesApi.Domain.Entities;
using ClubesApi.Domain.Enums;
using ClubesApi.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ClubesDbContext _db;
    private readonly JwtTokenService _tokenService;

    public AuthController(ClubesDbContext db, JwtTokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var emailNormalizado = request.Email.Trim().ToLowerInvariant();
        if (await _db.Clientes.AnyAsync(c => c.Email == emailNormalizado))
        {
            return Conflict("Ya existe un cliente con ese email.");
        }

        var cliente = new Cliente
        {
            ClienteId = Guid.NewGuid(),
            Nombre = request.Nombre,
            Email = emailNormalizado,
            Telefono = request.Telefono,
            Rol = RolCliente.Cliente,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FechaAlta = DateTime.UtcNow
        };

        _db.Clientes.Add(cliente);
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(cliente);
        return Ok(new AuthResponse(token, cliente.ClienteId, cliente.Nombre, cliente.Email, cliente.Rol.ToString()));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var emailNormalizado = request.Email.Trim().ToLowerInvariant();
        var cliente = await _db.Clientes.SingleOrDefaultAsync(c => c.Email == emailNormalizado);

        if (cliente is null || !BCrypt.Net.BCrypt.Verify(request.Password, cliente.PasswordHash))
        {
            return Unauthorized("Email o contraseña incorrectos.");
        }

        var token = _tokenService.GenerateToken(cliente);
        return Ok(new AuthResponse(token, cliente.ClienteId, cliente.Nombre, cliente.Email, cliente.Rol.ToString()));
    }
}
