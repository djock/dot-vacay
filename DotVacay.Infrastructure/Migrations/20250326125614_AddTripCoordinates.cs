using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DotVacay.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTripCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Trips",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Trips",
                type: "REAL",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Trips");
        }
    }
}
