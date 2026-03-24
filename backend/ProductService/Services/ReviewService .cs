using ProductService.DTOs;
using ProductService.Middlewares;
using ProductService.Models;
using ProductService.Repositories;
using ProductService.Services.Interface;

namespace ProductService.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository  _repo;
    private readonly IProductRepository _productRepo;

    public ReviewService(IReviewRepository repo, IProductRepository productRepo)
    {
        _repo        = repo;
        _productRepo = productRepo;
    }

    public async Task<IEnumerable<ReviewResponseDto>> GetByProductIdAsync(int productId)
    {
        var reviews = await _repo.GetByProductIdAsync(productId);
        return reviews.Select(MapToResponse);
    }

    public async Task<ReviewResponseDto> CreateAsync(CreateReviewDto dto)
    {
        // Validate rating
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new BadRequestException("Rating phải từ 1 đến 5.");

        // Kiểm tra sản phẩm tồn tại
        var product = await _productRepo.GetByIdAsync(dto.ProductId);
        if (product is null)
            throw new NotFoundException($"Không tìm thấy sản phẩm với Id = {dto.ProductId}");

        // Mỗi đơn hàng chỉ được review 1 lần
        if (await _repo.ExistsByOrderIdAsync(dto.OrderId))
            throw new BadRequestException($"Đơn hàng #{dto.OrderId} đã được đánh giá trước đó.");

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId    = dto.UserId,
            UserName  = dto.UserName,
            OrderId   = dto.OrderId,
            Title     = dto.Title.Trim(),
            Comment   = dto.Comment.Trim(),
            Rating    = dto.Rating,
            ImageUrl  = dto.ImageUrl,
        };

        var created = await _repo.CreateAsync(review);
        return MapToResponse(created);
    }

    public async Task<bool> HasReviewedAsync(int orderId)
        => await _repo.ExistsByOrderIdAsync(orderId);

    private static ReviewResponseDto MapToResponse(Review r) => new()
    {
        Id        = r.Id,
        ProductId = r.ProductId,
        UserId    = r.UserId,
        UserName  = r.UserName,
        OrderId   = r.OrderId,
        Title     = r.Title,
        Comment   = r.Comment,
        Rating    = r.Rating,
        ImageUrl  = r.ImageUrl,
        CreatedAt = r.CreatedAt,
    };

    public async Task<SellerRatingDto> GetSellerRatingAsync(int sellerId)
    {
        var products = await _productRepo.GetAllAsync();
        var sellerProducts = products.Where(p => p.SellerId == sellerId).Select(p => p.Id).ToList();

        if (!sellerProducts.Any())
            return new SellerRatingDto { SellerId = sellerId, AverageRating = 0, TotalReviews = 0 };

        var allReviews = new List<Review>();
        foreach (var pId in sellerProducts)
        {
            var r = await _repo.GetByProductIdAsync(pId);
            allReviews.AddRange(r);
        }

        if (!allReviews.Any())
            return new SellerRatingDto { SellerId = sellerId, AverageRating = 0, TotalReviews = 0 };

        return new SellerRatingDto
        {
            SellerId = sellerId,
            AverageRating = allReviews.Average(r => r.Rating),
            TotalReviews = allReviews.Count
        };
    }
}