using ProductService.Models;

namespace ProductService.Repositories;

public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetByProductIdAsync(int productId);
    Task<Review?>             GetByOrderIdAsync(int orderId);          // kiểm tra đã review chưa
    Task<Review>              CreateAsync(Review review);
    Task<bool>                ExistsByOrderIdAsync(int orderId);
}