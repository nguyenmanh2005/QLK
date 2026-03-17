using Microsoft.EntityFrameworkCore;
using ProductService.Models;

namespace ProductService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Review>  Reviews  => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Comment).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.UserName).IsRequired().HasMaxLength(100);

            // 1 đơn hàng chỉ được review đúng 1 lần
            entity.HasIndex(e => e.OrderId).IsUnique();

            // Rating 1-5
            entity.ToTable(t => t.HasCheckConstraint("CK_Review_Rating", "[Rating] BETWEEN 1 AND 5"));

            entity.HasOne(e => e.Product)
                  .WithMany()
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}