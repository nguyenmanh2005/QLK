namespace ProductService.DTOs;

// ── Gửi lên khi tạo review ──────────────────────────────────────────────────
public class CreateReviewDto
{
    public int    ProductId { get; set; }
    public int    UserId    { get; set; }
    public string UserName  { get; set; } = string.Empty;
    public int    OrderId   { get; set; }
    public string Title     { get; set; } = string.Empty;
    public string Comment   { get; set; } = string.Empty;
    public int    Rating    { get; set; }  // 1-5
    public string? ImageUrl { get; set; }
}

// ── Trả về client ────────────────────────────────────────────────────────────
public class ReviewResponseDto
{
    public int     Id        { get; set; }
    public int     ProductId { get; set; }
    public int     UserId    { get; set; }
    public string  UserName  { get; set; } = string.Empty;
    public int     OrderId   { get; set; }
    public string  Title     { get; set; } = string.Empty;
    public string  Comment   { get; set; } = string.Empty;
    public int     Rating    { get; set; }
    public string? ImageUrl  { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SellerRatingDto
{
    public int SellerId { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
}