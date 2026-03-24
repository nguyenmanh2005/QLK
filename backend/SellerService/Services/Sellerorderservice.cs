using System.Net.Http.Headers;
using System.Text.Json;
using SellerService.DTOs;
using SellerService.Services.Interface;

namespace SellerService.Services;

public class SellerOrderService : ISellerOrderService
{
    private readonly IHttpClientFactory _http;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNameCaseInsensitive = true };

    private static readonly string[] _allowedStatuses = ["Packing", "Shipping"];

    public SellerOrderService(IHttpClientFactory http)
    {
        _http = http;
    }

    public async Task<(bool Success, int StatusCode, object Data)> GetSellerOrdersAsync(
        string token, int sellerId)
    {
        var orderClient = CreateClient("OrderServiceClient", token);
        var productClient = CreateClient("ProductServiceClient", token);

        // 1. Lấy tất cả orders
        var orderRes = await orderClient.GetAsync("/api/orders");
        var orderBody = await orderRes.Content.ReadAsStringAsync();

        if (!orderRes.IsSuccessStatusCode)
            return (false, (int)orderRes.StatusCode, orderBody);

        var orders = JsonSerializer.Deserialize<List<OrderDto>>(orderBody, _json) ?? [];

        // 2. Lấy products của seller
        var productRes = await productClient.GetAsync($"/api/products/seller/{sellerId}");
        var productBody = await productRes.Content.ReadAsStringAsync();
        var products = JsonSerializer.Deserialize<List<ProductDto>>(productBody, _json) ?? [];
        var sellerProductIds = products.Select(p => p.Id).ToHashSet();

        // 3. Filter và map
        var filtered = new List<object>();

        foreach (var order in orders)
        {
            var productId = await ResolveProductIdAsync(order, orderClient);
            if (!sellerProductIds.Contains(productId)) continue;

            filtered.Add(new
            {
                order.Id,
                order.UserId,
                ProductId = productId,
                ProductName = products.FirstOrDefault(p => p.Id == productId)?.Name,
                order.Quantity,
                order.TotalPrice,
                order.Status,
                order.CreatedAt,
            });
        }

        return (true, 200, filtered.OrderByDescending(o => ((dynamic)o).Id));
    }

    public async Task<(bool Success, int StatusCode, string Body)> UpdateStatusAsync(
        string token, int orderId, UpdateOrderStatusDto dto)
    {
        if (!_allowedStatuses.Contains(dto.Status))
            return (false, 400, "Seller chỉ được cập nhật: Packing, Shipping!");

        var client = CreateClient("OrderServiceClient", token);
        var res = await client.PutAsJsonAsync($"/api/orders/{orderId}/status", dto);
        var body = await res.Content.ReadAsStringAsync();

        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    // ══════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════

    private HttpClient CreateClient(string name, string token)
    {
        var client = _http.CreateClient(name);
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private async Task<int> ResolveProductIdAsync(OrderDto order, HttpClient orderClient)
    {
        if (order.Product?.Id is > 0)
            return order.Product.Id;

        var detailRes = await orderClient.GetAsync($"/api/orders/{order.Id}");
        var detailBody = await detailRes.Content.ReadAsStringAsync();
        var detail = JsonSerializer.Deserialize<OrderDetailDto>(detailBody, _json);
        return detail?.ProductId ?? 0;
    }
}