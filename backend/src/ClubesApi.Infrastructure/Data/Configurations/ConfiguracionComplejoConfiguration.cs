using ClubesApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubesApi.Infrastructure.Data.Configurations;

public class ConfiguracionComplejoConfiguration : IEntityTypeConfiguration<ConfiguracionComplejo>
{
    public void Configure(EntityTypeBuilder<ConfiguracionComplejo> builder)
    {
        builder.HasKey(c => c.ConfiguracionId);
    }
}
