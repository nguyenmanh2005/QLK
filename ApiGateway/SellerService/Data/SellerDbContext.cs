using Microsoft.EntityFrameworkCore;
using SellerService.Models;

namespace SellerService.Data;

public class SellerDbContext : DbContext
{
    public SellerDbContext(DbContextOptions<SellerDbContext> options) : base(options) { }
    public DbSet<Seller> Sellers { get; set; }
}