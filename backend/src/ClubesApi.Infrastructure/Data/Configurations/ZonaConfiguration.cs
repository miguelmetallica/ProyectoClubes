using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class ZonaConfiguration : IEntityTypeConfiguration<Zona>
{
    public void Configure(EntityTypeBuilder<Zona> builder)
    {
        builder.HasKey(z => z.ZonaId);
        builder.Property(z => z.Nombre).IsRequired().HasMaxLength(100);

        builder.HasMany(z => z.Equipos)
            .WithOne(e => e.Zona)
            .HasForeignKey(e => e.ZonaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(z => z.Partidos)
            .WithOne(p => p.Zona)
            .HasForeignKey(p => p.ZonaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
