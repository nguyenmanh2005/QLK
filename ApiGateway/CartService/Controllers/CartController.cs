using CartService.DTOs;
using CartService.Models;
using CartService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CartService.Controllers
{
    [ApiController]
    [Route("api/cart")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly IProductClient _productClient;

        public CartController(ICartService cartService, IProductClient productClient)
        {
            _cartService = cartService;
            _productClient = productClient;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException();

        // GET /api/cart
        [HttpGet]
        public async Task<ActionResult<CartResponse>> GetCart()
        {
            var cart = await _cartService.GetCartAsync(UserId);

            if (!cart.Items.Any())
                return Ok(new CartResponse { UserId = UserId });

            var productIds = cart.Items.Select(i => i.ProductId).ToList();
            var products = await _productClient.GetProductsByIdsAsync(productIds);
            var productMap = products.ToDictionary(p => p.Id);

            var enrichedItems = cart.Items
                .Where(i => productMap.ContainsKey(i.ProductId))
                .Select(i =>
                {
                    var p = productMap[i.ProductId];
                    return new CartItemResponse
                    {
                        ProductId = i.ProductId,
                        SellerId = i.SellerId,
                        SellerName = p.SellerName,
                        Name = p.Name,
                        Price = p.Price,
                        ImageUrl = p.ImageUrl,
                        Stock = p.Stock,
                        Quantity = Math.Min(i.Quantity, p.Stock)
                    };
                }).ToList();

            return Ok(new CartResponse
            {
                UserId = UserId,
                Items = enrichedItems
            });
        }

        // POST /api/cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddItem([FromBody] AddToCartRequest request)
        {
            if (request.Quantity <= 0)
                return BadRequest("Số lượng phải lớn hơn 0");

            var products = await _productClient.GetProductsByIdsAsync([request.ProductId]);
            var product = products.FirstOrDefault();

            if (product == null)
                return NotFound("Sản phẩm không tồn tại");

            if (product.Stock < request.Quantity)
                return BadRequest($"Sản phẩm chỉ còn {product.Stock} trong kho");

            var item = new CartItem
            {
                ProductId = request.ProductId,
                SellerId = request.SellerId,
                Quantity = request.Quantity
            };

            await _cartService.AddItemAsync(UserId, item);
            return Ok(new { message = "Đã thêm vào giỏ hàng" });
        }

        // PUT /api/cart/item/{productId}
        [HttpPut("item/{productId}")]
        public async Task<IActionResult> UpdateItem(string productId, [FromBody] UpdateCartItemRequest request)
        {
            if (request.Quantity < 0)
                return BadRequest("Số lượng không hợp lệ");

            if (request.Quantity > 0)
            {
                var products = await _productClient.GetProductsByIdsAsync([productId]);
                var product = products.FirstOrDefault();

                if (product != null && request.Quantity > product.Stock)
                    return BadRequest($"Sản phẩm chỉ còn {product.Stock} trong kho");
            }

            await _cartService.UpdateItemAsync(UserId, productId, request.Quantity);
            return Ok(new { message = "Đã cập nhật giỏ hàng" });
        }

        // DELETE /api/cart/item/{productId}
        [HttpDelete("item/{productId}")]
        public async Task<IActionResult> RemoveItem(string productId)
        {
            await _cartService.RemoveItemAsync(UserId, productId);
            return Ok(new { message = "Đã xoá sản phẩm khỏi giỏ hàng" });
        }

        // DELETE /api/cart
        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            await _cartService.ClearCartAsync(UserId);
            return Ok(new { message = "Đã xoá giỏ hàng" });
        }

        // GET /api/cart/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetCount()
        {
            var cart = await _cartService.GetCartAsync(UserId);
            return Ok(cart.Items.Sum(i => i.Quantity));
        }
    }
}
