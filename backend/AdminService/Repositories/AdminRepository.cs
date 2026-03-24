using Microsoft.EntityFrameworkCore;
using AdminService.Data;
using AdminService.Models;

namespace AdminService.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly AdminDbContext _db;
    public AdminRepository(AdminDbContext db) => _db = db;

    public async Task<Admin?> GetByEmailAsync(string email)
        => await _db.Admins.FirstOrDefaultAsync(a => a.Email == email);

    public async Task<Admin?> GetByIdAsync(int id)
        => await _db.Admins.FindAsync(id);

    public async Task<Admin> CreateAsync(Admin admin)
    {
        _db.Admins.Add(admin);
        await _db.SaveChangesAsync();
        return admin;
    }
}