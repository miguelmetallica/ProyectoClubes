using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class PartidoConfiguration : IEntityTypeConfiguration<Partido>
{
    public void Configure(EntityTypeBuilder<Partido> builder)
    {
        builder.HasKey(p => p.PartidoId);
        builder.Property(p => p.Estado).HasConversion<string>().HasMaxLength(20);

        builder.HasMany(p => p.Eventos)
            .WithOne(ev => ev.Partido)
            .HasForeignKey(ev => ev.PartidoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
