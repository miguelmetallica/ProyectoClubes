using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class PagoConfiguration : IEntityTypeConfiguration<Pago>
{
    public void Configure(EntityTypeBuilder<Pago> builder)
    {
        builder.HasKey(p => p.PagoId);
        builder.Property(p => p.Metodo).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.Estado).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.Monto).HasColumnType("decimal(12,2)");
        builder.Property(p => p.ComprobanteUrl).HasMaxLength(500);
        builder.Property(p => p.ExternalPaymentId).HasMaxLength(100);
        builder.Property(p => p.MotivoRechazo).HasMaxLength(500);

        builder.HasOne(p => p.Validador)
            .WithMany()
            .HasForeignKey(p => p.ValidadoPor)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
