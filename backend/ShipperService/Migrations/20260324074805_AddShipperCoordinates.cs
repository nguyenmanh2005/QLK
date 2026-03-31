using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShipperService.Migrations
{
    /// <inheritdoc />
    public partial class AddShipperCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Shippers",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Shippers",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Shippers");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Shippers");
        }
    }
}
