namespace ProductService.DTOs;

public class CreateProductDto
{
    public string   Name        { get; set; } = string.Empty;
    public string?  Description { get; set; }
    public decimal  Price       { get; set; }
    public int      Stock       { get; set; }
    public string?  ImageUrl    { get; set; }
    public int?     SellerId    { get; set; }
    public int?     CategoryId  { get; set; }  // ← thêm
}

public class UpdateProductDto
{
    public string   Name        { get; set; } = string.Empty;
    public string?  Description { get; set; }
    public decimal  Price       { get; set; }
    public int      Stock       { get; set; }
    public string?  ImageUrl    { get; set; }
    public int?     SellerId    { get; set; }
    public int?     CategoryId  { get; set; }  // ← thêm
}

public class ProductResponseDto
{
    public int      Id           { get; set; }
    public string   Name         { get; set; } = string.Empty;
    public string?  Description  { get; set; }
    public decimal  Price        { get; set; }
    public int      Stock        { get; set; }
    public string?  ImageUrl     { get; set; }
    public int?     SellerId     { get; set; }
    public int?     CategoryId   { get; set; }    // ← thêm
    public string?  CategoryName { get; set; }    // ← thêm (tiện cho FE hiển thị)
    public DateTime CreatedAt    { get; set; }
}