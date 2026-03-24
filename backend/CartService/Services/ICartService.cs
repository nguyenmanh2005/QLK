using CartService.Models;

namespace CartService.Services
{
    public interface ICartService
    {
        Task<Cart> GetCartAsync(string userId);
        Task AddItemAsync(string userId, CartItem item);
        Task UpdateItemAsync(string userId, string productId, int quantity);
        Task RemoveItemAsync(string userId, string productId);
        Task ClearCartAsync(string userId);
    }
}