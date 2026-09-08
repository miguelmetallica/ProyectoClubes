using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class JugadorConfiguration : IEntityTypeConfiguration<Jugador>
{
    public void Configure(EntityTypeBuilder<Jugador> builder)
    {
        builder.HasKey(j => j.JugadorId);
        builder.Property(j => j.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(j => j.Posicion).HasMaxLength(50);

        builder.HasMany(j => j.Eventos)
            .WithOne(ev => ev.Jugador)
            .HasForeignKey(ev => ev.JugadorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
