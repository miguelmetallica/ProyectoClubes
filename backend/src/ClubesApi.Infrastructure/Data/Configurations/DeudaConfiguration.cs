using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class DeudaConfiguration : IEntityTypeConfiguration<Deuda>
{
    public void Configure(EntityTypeBuilder<Deuda> builder)
    {
        builder.HasKey(d => d.DeudaId);
        builder.Property(d => d.Concepto).IsRequired().HasMaxLength(200);
        builder.Property(d => d.Monto).HasColumnType("decimal(12,2)");
        builder.Property(d => d.Estado).HasConversion<string>().HasMaxLength(20);
    }
}
