using OrderService.DTOs;

namespace OrderService.HttpClients;

public class UserServiceClient
{
    private readonly HttpClient _httpClient;

    public UserServiceClient(HttpClient httpClient) => _httpClient = httpClient;

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<UserDto>($"/api/users/{userId}");
        }
        catch
        {
            return null;
        }
    }
}

public class ProductServiceClient
{
    private readonly HttpClient _httpClient;

    public ProductServiceClient(HttpClient httpClient) => _httpClient = httpClient;

    public async Task<ProductDto?> GetProductByIdAsync(int productId)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<ProductDto>($"/api/products/{productId}");
        }
        catch
        {
            return null;
        }
    }
}
