using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class EventoPartidoConfiguration : IEntityTypeConfiguration<EventoPartido>
{
    public void Configure(EntityTypeBuilder<EventoPartido> builder)
    {
        builder.HasKey(ev => ev.EventoId);
        builder.Property(ev => ev.Tipo).HasConversion<string>().HasMaxLength(20);
    }
}
