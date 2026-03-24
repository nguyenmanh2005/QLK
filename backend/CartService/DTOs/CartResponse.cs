namespace CartService.DTOs
{
    public class CartItemResponse
    {
        public string ProductId { get; set; } = string.Empty;
        public string SellerId { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public int Stock { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal => Price * Quantity;
    }

    public class SellerGroup
    {
        public string SellerId { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public List<CartItemResponse> Items { get; set; } = new();
        public decimal SubTotal { get; set; }
    }

    public class CartResponse
    {
        public string UserId { get; set; } = string.Empty;
        public List<CartItemResponse> Items { get; set; } = new();
        public decimal TotalPrice => Items.Sum(i => i.Subtotal);
        public int TotalItems => Items.Sum(i => i.Quantity);

        public List<SellerGroup> SellerGroups => Items
            .GroupBy(i => i.SellerId)
            .Select(g => new SellerGroup
            {
                SellerId = g.Key,
                SellerName = g.First().SellerName,
                Items = g.ToList(),
                SubTotal = g.Sum(i => i.Subtotal)
            }).ToList();
    }
}
