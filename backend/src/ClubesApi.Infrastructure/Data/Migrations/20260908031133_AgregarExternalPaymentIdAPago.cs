using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClubesApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AgregarExternalPaymentIdAPago : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalPaymentId",
                table: "Pagos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExternalPaymentId",
                table: "Pagos");
        }
    }
}
