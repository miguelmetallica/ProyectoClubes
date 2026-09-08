using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class TorneoConfiguration : IEntityTypeConfiguration<Torneo>
{
    public void Configure(EntityTypeBuilder<Torneo> builder)
    {
        builder.HasKey(t => t.TorneoId);
        builder.Property(t => t.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Deporte).HasConversion<string>().HasMaxLength(20);
        builder.Property(t => t.Categoria).HasMaxLength(100);
        builder.Property(t => t.SistemaCompetencia).HasConversion<string>().HasMaxLength(30);

        builder.HasMany(t => t.Zonas)
            .WithOne(z => z.Torneo)
            .HasForeignKey(z => z.TorneoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
