using CartService.Models;
using Microsoft.AspNetCore.Cors.Infrastructure;
using System.Collections.Concurrent;

namespace CartService.Services
{
    public class InMemoryCartService : ICartService
    {
        // ConcurrentDictionary an toàn khi nhiều request cùng lúc
        private static readonly ConcurrentDictionary<string, Cart> _store = new();

        public Task<Cart> GetCartAsync(string userId)
        {
            var cart = _store.GetValueOrDefault(userId) ?? new Cart { UserId = userId };
            return Task.FromResult(cart);
        }

        public Task AddItemAsync(string userId, CartItem newItem)
        {
            var cart = _store.GetOrAdd(userId, _ => new Cart { UserId = userId });

            lock (cart)
            {
                var existing = cart.Items.FirstOrDefault(i => i.ProductId == newItem.ProductId);
                if (existing != null)
                    existing.Quantity += newItem.Quantity;
                else
                    cart.Items.Add(newItem);

                cart.UpdatedAt = DateTime.UtcNow;
            }

            return Task.CompletedTask;
        }

        public Task UpdateItemAsync(string userId, string productId, int quantity)
        {
            if (!_store.TryGetValue(userId, out var cart)) return Task.CompletedTask;

            lock (cart)
            {
                var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
                if (item == null) return Task.CompletedTask;

                if (quantity <= 0)
                    cart.Items.Remove(item);
                else
                    item.Quantity = quantity;

                cart.UpdatedAt = DateTime.UtcNow;
            }

            return Task.CompletedTask;
        }

        public Task RemoveItemAsync(string userId, string productId)
        {
            if (!_store.TryGetValue(userId, out var cart)) return Task.CompletedTask;

            lock (cart)
            {
                cart.Items.RemoveAll(i => i.ProductId == productId);
                cart.UpdatedAt = DateTime.UtcNow;
            }

            return Task.CompletedTask;
        }

        public Task ClearCartAsync(string userId)
        {
            _store.TryRemove(userId, out _);
            return Task.CompletedTask;
        }
    }
}