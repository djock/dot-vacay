using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DotVacay.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStartDateEndDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EndDate",
                table: "Trips",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "StartDate",
                table: "Trips",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "PointsOfInterest",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "PointsOfInterest",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EndDate",
                table: "PointsOfInterest",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "StartDate",
                table: "PointsOfInterest",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TripDayIndex",
                table: "PointsOfInterest",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "PointsOfInterest");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "PointsOfInterest");

            migrationBuilder.DropColumn(
                name: "TripDayIndex",
                table: "PointsOfInterest");

            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "PointsOfInterest",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "PointsOfInterest",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);
        }
    }
}
