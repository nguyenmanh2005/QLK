using Microsoft.EntityFrameworkCore;
using SellerService.Data;
using SellerService.Models;

namespace SellerService.Repositories;

public class SellerRepository : ISellerRepository
{
    private readonly SellerDbContext _db;
    public SellerRepository(SellerDbContext db) => _db = db;

    public async Task<Seller?> GetByEmailAsync(string email)
        => await _db.Sellers.FirstOrDefaultAsync(s => s.Email == email);

    public async Task<Seller?> GetByIdAsync(int id)
        => await _db.Sellers.FindAsync(id);

    public async Task<Seller> CreateAsync(Seller seller)
    {
        _db.Sellers.Add(seller);
        await _db.SaveChangesAsync();
        return seller;
    }

    public async Task<IEnumerable<Seller>> GetAllAsync()  // ← THÊM
        => await _db.Sellers.ToListAsync();
        public async Task UpdateAsync(Seller seller)
{
    _db.Sellers.Update(seller);
    await _db.SaveChangesAsync();
}

public async Task<bool> DeleteAsync(int id)
{
    var seller = await _db.Sellers.FindAsync(id);
    if (seller is null) return false;
    _db.Sellers.Remove(seller);
    await _db.SaveChangesAsync();
    return true;
}
}
