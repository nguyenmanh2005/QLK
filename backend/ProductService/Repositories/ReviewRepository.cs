using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

namespace ProductService.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _db;
    public ReviewRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Review>> GetByProductIdAsync(int productId)
        => await _db.Reviews
                    .Where(r => r.ProductId == productId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

    public async Task<Review?> GetByOrderIdAsync(int orderId)
        => await _db.Reviews.FirstOrDefaultAsync(r => r.OrderId == orderId);

    public async Task<bool> ExistsByOrderIdAsync(int orderId)
        => await _db.Reviews.AnyAsync(r => r.OrderId == orderId);

    public async Task<Review> CreateAsync(Review review)
    {
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();
        return review;
    }
}