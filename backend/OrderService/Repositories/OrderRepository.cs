using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;

namespace OrderService.Repositories;

public interface IOrderRepository
{
    Task<IEnumerable<Order>> GetAllAsync();
    Task<Order?>             GetByIdAsync(int id);
    Task<IEnumerable<Order>> GetByUserIdAsync(int userId);
    Task<Order>              CreateAsync(Order order);
    Task<Order?>             UpdateStatusAsync(int id, string status);
    Task<Order?>             AssignShipperAsync(int id, int shipperId);  // thêm mới
    Task<bool>               DeleteAsync(int id);
}

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;
    public OrderRepository(AppDbContext context) => _context = context;

    public async Task<IEnumerable<Order>> GetAllAsync()
        => await _context.Orders.AsNoTracking().ToListAsync();

    public async Task<Order?> GetByIdAsync(int id)
        => await _context.Orders.AsNoTracking()
                                .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<IEnumerable<Order>> GetByUserIdAsync(int userId)
        => await _context.Orders.AsNoTracking()
                                .Where(o => o.UserId == userId)
                                .ToListAsync();

    public async Task<Order> CreateAsync(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> UpdateStatusAsync(int id, string status)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order is null) return null;

        order.Status = status;
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> AssignShipperAsync(int id, int shipperId)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order is null) return null;
        if (order.Status != "Shipping") return null;

        order.ShipperId = shipperId;
        order.Status    = "Delivering";
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order is null) return false;

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return true;
    }
}