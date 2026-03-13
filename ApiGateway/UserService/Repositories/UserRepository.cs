using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models;

namespace UserService.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context) => _context = context;

    public async Task<IEnumerable<User>> GetAllAsync()
        => await _context.Users.AsNoTracking().ToListAsync();

    public async Task<User?> GetByIdAsync(int id)
        => await _context.Users.AsNoTracking()
                               .FirstOrDefaultAsync(u => u.Id == id);

    // ← MỚI: lấy nhiều user 1 query
    public async Task<IEnumerable<User>> GetByIdsAsync(IEnumerable<int> ids)
        => await _context.Users.AsNoTracking()
                               .Where(u => ids.Contains(u.Id))
                               .ToListAsync();

    public async Task<User?> GetByEmailAsync(string email)
        => await _context.Users.AsNoTracking()
                               .FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> UpdateAsync(int id, User user)
    {
        var existing = await _context.Users.FindAsync(id);
        if (existing is null) return null;

        existing.Name = user.Name;
        existing.Email = user.Email;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }
}