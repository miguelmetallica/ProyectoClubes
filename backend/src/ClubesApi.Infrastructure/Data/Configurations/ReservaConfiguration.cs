using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class ReservaConfiguration : IEntityTypeConfiguration<Reserva>
{
    public void Configure(EntityTypeBuilder<Reserva> builder)
    {
        builder.HasKey(r => r.ReservaId);
        builder.Property(r => r.Estado).HasConversion<string>().HasMaxLength(30);
        builder.Property(r => r.PrecioTotal).HasColumnType("decimal(12,2)");
        builder.Property(r => r.MontoReintegrado).HasColumnType("decimal(12,2)");
        builder.Property(r => r.MotivoCancelacion).HasMaxLength(500);

        builder.HasOne(r => r.Pago)
            .WithOne(p => p.Reserva)
            .HasForeignKey<Pago>(p => p.ReservaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
