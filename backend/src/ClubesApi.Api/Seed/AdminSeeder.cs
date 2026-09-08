using ClubesApi.Domain.Entities;
using ClubesApi.Domain.Enums;
using ClubesApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Api.Seed;

/// <summary>
/// Crea el primer usuario Admin al arrancar, si se configuró uno y todavía no existe.
/// Sin esto no hay forma de acceder al panel administrador salvo editando la base a mano
/// (POST /api/auth/register siempre crea clientes con rol Cliente).
/// </summary>
public static class AdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration, ILogger logger)
    {
        var email = configuration["Seed:AdminEmail"];
        var password = configuration["Seed:AdminPassword"];

        if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning(
                "Seed de admin incompleto: hace falta configurar tanto Seed:AdminEmail como Seed:AdminPassword. No se creó ningún usuario.");
            return;
        }

        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ClubesDbContext>();

        var emailNormalizado = email.Trim().ToLowerInvariant();
        if (await db.Clientes.AnyAsync(c => c.Email == emailNormalizado))
        {
            return;
        }

        db.Clientes.Add(new Cliente
        {
            ClienteId = Guid.NewGuid(),
            Nombre = configuration["Seed:AdminNombre"] is { Length: > 0 } nombre ? nombre : "Administrador",
            Email = emailNormalizado,
            Rol = RolCliente.Admin,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FechaAlta = DateTime.UtcNow
        });

        await db.SaveChangesAsync();
        logger.LogInformation("Usuario admin creado por seed: {Email}", emailNormalizado);
    }
}
