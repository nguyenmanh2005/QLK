using System.Net.Http.Json;
using OrderService.DTOs;

namespace OrderService.HttpClients;

public class UserServiceClient
{
    private readonly HttpClient _httpClient;

    public UserServiceClient(HttpClient httpClient) => _httpClient = httpClient;

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        try { return await _httpClient.GetFromJsonAsync<UserDto>($"/api/users/{userId}"); }
        catch { return null; }
    }

    public async Task<Dictionary<int, UserDto>> GetUsersByIdsAsync(IEnumerable<int> ids)
    {
        try
        {
            var idList = ids.ToList();
            if (!idList.Any()) return new();
            var query = string.Join(",", idList);
            var users = await _httpClient.GetFromJsonAsync<List<UserDto>>($"/api/users/batch?ids={query}");
            return users?.ToDictionary(u => u.Id) ?? new();
        }
        catch { return new(); }
    }
}

public class ProductServiceClient
{
    private readonly HttpClient _httpClient;

    public ProductServiceClient(HttpClient httpClient) => _httpClient = httpClient;

    public async Task<ProductDto?> GetProductByIdAsync(int productId)
    {
        try { return await _httpClient.GetFromJsonAsync<ProductDto>($"/api/products/{productId}"); }
        catch { return null; }
    }

    public async Task<Dictionary<int, ProductDto>> GetProductsByIdsAsync(IEnumerable<int> ids)
    {
        try
        {
            var idList = ids.ToList();
            if (!idList.Any()) return new();
            var query = string.Join(",", idList);
            var products = await _httpClient.GetFromJsonAsync<List<ProductDto>>($"/api/products/batch?ids={query}");
            return products?.ToDictionary(p => p.Id) ?? new();
        }
        catch { return new(); }
    }
}