using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class GastoConfiguration : IEntityTypeConfiguration<Gasto>
{
    public void Configure(EntityTypeBuilder<Gasto> builder)
    {
        builder.HasKey(g => g.GastoId);
        builder.Property(g => g.Concepto).IsRequired().HasMaxLength(200);
        builder.Property(g => g.Monto).HasColumnType("decimal(12,2)");
    }
}
