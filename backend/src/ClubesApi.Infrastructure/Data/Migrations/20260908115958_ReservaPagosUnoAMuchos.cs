using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClubesApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ReservaPagosUnoAMuchos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pagos_ReservaId",
                table: "Pagos");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_ReservaId",
                table: "Pagos",
                column: "ReservaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pagos_ReservaId",
                table: "Pagos");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_ReservaId",
                table: "Pagos",
                column: "ReservaId",
                unique: true);
        }
    }
}
