using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class EquipoConfiguration : IEntityTypeConfiguration<Equipo>
{
    public void Configure(EntityTypeBuilder<Equipo> builder)
    {
        builder.HasKey(e => e.EquipoId);
        builder.Property(e => e.Nombre).IsRequired().HasMaxLength(200);

        builder.HasMany(e => e.Jugadores)
            .WithOne(j => j.Equipo)
            .HasForeignKey(j => j.EquipoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.PartidosComoLocal)
            .WithOne(p => p.EquipoLocal)
            .HasForeignKey(p => p.EquipoLocalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.PartidosComoVisitante)
            .WithOne(p => p.EquipoVisitante)
            .HasForeignKey(p => p.EquipoVisitanteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
