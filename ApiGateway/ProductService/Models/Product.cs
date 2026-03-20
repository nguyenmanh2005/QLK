namespace ProductService.Models;

public class Product
{
    public int      Id          { get; set; }
    public string   Name        { get; set; } = string.Empty;
    public string?  Description { get; set; }
    public decimal  Price       { get; set; }
    public int      Stock       { get; set; }
    public string?  ImageUrl    { get; set; }
    public int?     SellerId    { get; set; }
    public int?     CategoryId  { get; set; }          // ← thêm
    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;

    // Navigation
    public Category? Category   { get; set; }          // ← thêm
}