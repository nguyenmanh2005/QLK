using Microsoft.EntityFrameworkCore;
using OrderService.Models;

namespace OrderService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Pending");
        });
    }
}
