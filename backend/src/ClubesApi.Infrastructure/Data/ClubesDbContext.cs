using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClubesApi.Infrastructure.Data;

public class ClubesDbContext : DbContext
{
    public ClubesDbContext(DbContextOptions<ClubesDbContext> options) : base(options)
    {
    }

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Espacio> Espacios => Set<Espacio>();
    public DbSet<Reserva> Reservas => Set<Reserva>();
    public DbSet<Pago> Pagos => Set<Pago>();

    public DbSet<Torneo> Torneos => Set<Torneo>();
    public DbSet<Zona> Zonas => Set<Zona>();
    public DbSet<Equipo> Equipos => Set<Equipo>();
    public DbSet<Jugador> Jugadores => Set<Jugador>();
    public DbSet<Partido> Partidos => Set<Partido>();
    public DbSet<EventoPartido> EventosPartido => Set<EventoPartido>();

    public DbSet<Deuda> Deudas => Set<Deuda>();
    public DbSet<Gasto> Gastos => Set<Gasto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ClubesDbContext).Assembly);
    }
}
