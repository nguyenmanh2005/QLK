using ShipperService.Models;

namespace ShipperService.Repositories;

public interface IShipperRepository
{
    Task<Shipper?> GetByEmailAsync(string email);
    Task<Shipper?> GetByIdAsync(int id);
    Task<Shipper>  CreateAsync(Shipper shipper);
    Task<IEnumerable<Shipper>> GetAllAsync();
Task UpdateAsync(Shipper shipper);
Task<bool> DeleteAsync(int id);
}