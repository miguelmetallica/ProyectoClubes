using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.HasKey(c => c.ClienteId);
        builder.Property(c => c.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Email).IsRequired().HasMaxLength(200);
        builder.HasIndex(c => c.Email).IsUnique();
        builder.Property(c => c.Telefono).HasMaxLength(50);
        builder.Property(c => c.Rol).HasConversion<string>().HasMaxLength(20);
        builder.Property(c => c.PasswordHash).IsRequired();

        builder.HasMany(c => c.Reservas)
            .WithOne(r => r.Cliente)
            .HasForeignKey(r => r.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Deudas)
            .WithOne(d => d.Cliente)
            .HasForeignKey(d => d.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.EquiposComoCapitan)
            .WithOne(e => e.Capitan)
            .HasForeignKey(e => e.CapitanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
