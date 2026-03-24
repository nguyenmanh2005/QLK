using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SellerService.Migrations
{
    /// <inheritdoc />
    public partial class AddQrPaymentToSeller : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccountName",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountNo",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankCode",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "QrApprovedAt",
                table: "Sellers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QrRejectedReason",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QrStatus",
                table: "Sellers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "QrSubmittedAt",
                table: "Sellers",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountName",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "AccountNo",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "BankCode",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "QrApprovedAt",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "QrRejectedReason",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "QrStatus",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "QrSubmittedAt",
                table: "Sellers");
        }
    }
}
