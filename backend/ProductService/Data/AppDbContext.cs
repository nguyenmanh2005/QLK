using Microsoft.EntityFrameworkCore;
using ProductService.Models;

namespace ProductService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product>  Products   => Set<Product>();
    public DbSet<Review>   Reviews    => Set<Review>();
    public DbSet<Category> Categories => Set<Category>();  // ← thêm

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");

            // FK → Category (nullable, xóa category không xóa product)
            entity.HasOne(e => e.Category)
                  .WithMany()
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Comment).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.UserName).IsRequired().HasMaxLength(100);

            entity.HasIndex(e => e.OrderId).IsUnique();
            entity.ToTable(t => t.HasCheckConstraint("CK_Review_Rating", "[Rating] BETWEEN 1 AND 5"));

            entity.HasOne(e => e.Product)
                  .WithMany()
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.SortOrder).HasDefaultValue(0);
        });
    }
}