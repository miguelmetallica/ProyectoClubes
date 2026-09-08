using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClubesApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ConfiguracionComplejoYVencimientoValidacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VencimientoValidacionHoras",
                table: "Espacios",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ConfiguracionComplejo",
                columns: table => new
                {
                    ConfiguracionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HoraApertura = table.Column<TimeOnly>(type: "time", nullable: false),
                    HoraCierre = table.Column<TimeOnly>(type: "time", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracionComplejo", x => x.ConfiguracionId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfiguracionComplejo");

            migrationBuilder.DropColumn(
                name: "VencimientoValidacionHoras",
                table: "Espacios");
        }
    }
}
