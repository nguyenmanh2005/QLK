using Microsoft.EntityFrameworkCore.Migrations;

public partial class AddQrPaymentToSeller : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "BankCode",
            table: "Sellers",
            type: "nvarchar(20)",
            maxLength: 20,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "AccountNo",
            table: "Sellers",
            type: "nvarchar(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "AccountName",
            table: "Sellers",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "QrStatus",
            table: "Sellers",
            type: "int",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<string>(
            name: "QrRejectedReason",
            table: "Sellers",
            type: "nvarchar(500)",
            maxLength: 500,
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "QrSubmittedAt",
            table: "Sellers",
            type: "datetime2",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "QrApprovedAt",
            table: "Sellers",
            type: "datetime2",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "BankCode",          table: "Sellers");
        migrationBuilder.DropColumn(name: "AccountNo",         table: "Sellers");
        migrationBuilder.DropColumn(name: "AccountName",       table: "Sellers");
        migrationBuilder.DropColumn(name: "QrStatus",          table: "Sellers");
        migrationBuilder.DropColumn(name: "QrRejectedReason",  table: "Sellers");
        migrationBuilder.DropColumn(name: "QrSubmittedAt",     table: "Sellers");
        migrationBuilder.DropColumn(name: "QrApprovedAt",      table: "Sellers");
    }
}