using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SellerService.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Sellers",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Sellers",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Sellers");
        }
    }
}
