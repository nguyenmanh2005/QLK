namespace CartService.DTOs
{
    public class ProductInfo
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public int Stock { get; set; }
        public string SellerId { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
    }
}
