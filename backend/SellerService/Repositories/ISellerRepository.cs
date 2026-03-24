using SellerService.Models;

namespace SellerService.Repositories;

public interface ISellerRepository
{
    Task<Seller?> GetByEmailAsync(string email);
    Task<Seller?> GetByIdAsync(int id);
    Task<Seller> CreateAsync(Seller seller);
    Task<IEnumerable<Seller>> GetAllAsync();  // ← THÊM
    Task UpdateAsync(Seller seller);
Task<bool> DeleteAsync(int id);
}