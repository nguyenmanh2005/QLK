using ProductService.DTOs;

namespace ProductService.Services.Interface;

public interface IReviewService
{
    Task<IEnumerable<ReviewResponseDto>> GetByProductIdAsync(int productId);
    Task<ReviewResponseDto>              CreateAsync(CreateReviewDto dto);
    Task<bool>                           HasReviewedAsync(int orderId);
}