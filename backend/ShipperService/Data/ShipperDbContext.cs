using Microsoft.EntityFrameworkCore;
using ShipperService.Models;

namespace ShipperService.Data;

public class ShipperDbContext : DbContext
{
    public ShipperDbContext(DbContextOptions<ShipperDbContext> options) : base(options) { }
    public DbSet<Shipper> Shippers { get; set; }
    public DbSet<ShipperReview> ShipperReviews { get; set; }
}