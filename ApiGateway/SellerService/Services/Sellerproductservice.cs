using System.Net.Http.Headers;
using SellerService.DTOs;
using SellerService.Services.Interface;

namespace SellerService.Services;

public class SellerProductService : ISellerProductService
{
    private readonly IHttpClientFactory _http;

    public SellerProductService(IHttpClientFactory http)
    {
        _http = http;
    }

    public async Task<(bool Success, int StatusCode, string Body)> GetAllAsync(
        string token, int sellerId)
    {
        var res = await CreateClient(token).GetAsync($"/api/products/seller/{sellerId}");
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> CreateAsync(
        string token, CreateProductDto dto)
    {
        var res = await CreateClient(token).PostAsJsonAsync("/api/products", dto);
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> UpdateAsync(
        string token, int id, UpdateProductDto dto)
    {
        var res = await CreateClient(token).PutAsJsonAsync($"/api/products/{id}", dto);
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> DeleteAsync(
        string token, int id, int sellerId)
    {
        var client = CreateClient(token);

        // Kiểm tra product có thuộc seller không
        var checkRes = await client.GetAsync($"/api/products/{id}");
        if (!checkRes.IsSuccessStatusCode)
            return (false, 404, "Không tìm thấy sản phẩm");

        var product = await checkRes.Content.ReadFromJsonAsync<ProductDto>();
        if (product?.SellerId != sellerId)
            return (false, 403, "Không có quyền xóa sản phẩm này");

        var res = await client.DeleteAsync($"/api/products/{id}");
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    // ══════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════

    private HttpClient CreateClient(string token)
    {
        var client = _http.CreateClient("ProductServiceClient");
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        return client;
    }
}