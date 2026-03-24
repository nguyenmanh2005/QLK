namespace ProductService.Models;

public class Review
{
    public int     Id          { get; set; }
    public int     ProductId   { get; set; }
    public int     UserId      { get; set; }
    public string  UserName    { get; set; } = string.Empty;
    public int     OrderId     { get; set; }   // ràng buộc: 1 đơn chỉ review 1 lần
    public string  Title       { get; set; } = string.Empty;
    public string  Comment     { get; set; } = string.Empty;
    public int     Rating      { get; set; }   // 1-5
    public string? ImageUrl    { get; set; }
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;

    // Navigation
    public Product Product { get; set; } = null!;
}