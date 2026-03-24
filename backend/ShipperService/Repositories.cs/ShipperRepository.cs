using Microsoft.EntityFrameworkCore;
using ShipperService.Data;
using ShipperService.Models;

namespace ShipperService.Repositories;

public class ShipperRepository : IShipperRepository
{
    private readonly ShipperDbContext _db;
    public ShipperRepository(ShipperDbContext db) => _db = db;

    public async Task<Shipper?> GetByEmailAsync(string email)
        => await _db.Shippers.FirstOrDefaultAsync(s => s.Email == email);

    public async Task<Shipper?> GetByIdAsync(int id)
        => await _db.Shippers.FindAsync(id);

    public async Task<Shipper> CreateAsync(Shipper shipper)
    {
        _db.Shippers.Add(shipper);
        await _db.SaveChangesAsync();
        return shipper;
    }
    public async Task<IEnumerable<Shipper>> GetAllAsync()
    => await _db.Shippers.ToListAsync();

public async Task UpdateAsync(Shipper shipper)
{
    _db.Shippers.Update(shipper);
    await _db.SaveChangesAsync();
}

public async Task<bool> DeleteAsync(int id)
{
    var shipper = await _db.Shippers.FindAsync(id);
    if (shipper is null) return false;
    _db.Shippers.Remove(shipper);
    await _db.SaveChangesAsync();
    return true;
}
}