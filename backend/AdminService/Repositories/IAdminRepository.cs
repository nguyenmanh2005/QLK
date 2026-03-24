using AdminService.Models;

namespace AdminService.Repositories;

public interface IAdminRepository
{
    Task<Admin?> GetByEmailAsync(string email);
    Task<Admin?> GetByIdAsync(int id);
    Task<Admin>  CreateAsync(Admin admin);
}