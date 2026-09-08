using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class EspacioConfiguration : IEntityTypeConfiguration<Espacio>
{
    public void Configure(EntityTypeBuilder<Espacio> builder)
    {
        builder.HasKey(e => e.EspacioId);
        builder.Property(e => e.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Deporte).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Modalidad).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.PrecioBase).HasColumnType("decimal(12,2)");
        builder.Property(e => e.PctSena).HasColumnType("decimal(5,2)");

        builder.HasMany(e => e.Reservas)
            .WithOne(r => r.Espacio)
            .HasForeignKey(r => r.EspacioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.Partidos)
            .WithOne(p => p.Espacio)
            .HasForeignKey(p => p.EspacioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
