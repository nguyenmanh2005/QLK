using System.Net.Http.Headers;
using System.Text.Json;
using ShipperService.DTOs;
using ShipperService.Services.Interface;

namespace ShipperService.Services;

public class ShipperOrderService : IShipperOrderService
{
    private readonly IHttpClientFactory _http;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNameCaseInsensitive = true };

    public ShipperOrderService(IHttpClientFactory http)
    {
        _http = http;
    }

    public async Task<(bool Success, int StatusCode, object Data)> GetAvailableAsync(string token)
    {
        var (ok, status, orders) = await FetchAllOrdersAsync(token);
        if (!ok) return (false, status, orders!);

        var filtered = ((List<OrderDto>)orders!).Where(o =>
            o.Status == "Shipping" && o.ShipperId == null).ToList();

        return (true, 200, filtered);
    }

    public async Task<(bool Success, int StatusCode, object Data)> GetMyDeliveringAsync(
        string token, int shipperId)
    {
        var (ok, status, orders) = await FetchAllOrdersAsync(token);
        if (!ok) return (false, status, orders!);

        var filtered = ((List<OrderDto>)orders!).Where(o =>
            o.Status == "Delivering" && o.ShipperId == shipperId).ToList();

        return (true, 200, filtered);
    }

    public async Task<(bool Success, int StatusCode, object Data)> GetMyDeliveredAsync(
        string token, int shipperId)
    {
        var (ok, status, orders) = await FetchAllOrdersAsync(token);
        if (!ok) return (false, status, orders!);

        var filtered = ((List<OrderDto>)orders!).Where(o =>
            o.Status == "Delivered" && o.ShipperId == shipperId).ToList();

        return (true, 200, filtered);
    }

    public async Task<(bool Success, int StatusCode, string Body)> AssignAsync(
        string token, int orderId, int shipperId)
    {
        var client = CreateClient(token);
        var res = await client.PatchAsJsonAsync(
            $"/api/orders/{orderId}/assign-shipper", new { shipperId });
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> ConfirmDeliveredAsync(
        string token, int orderId, int shipperId)
    {
        var client = CreateClient(token);

        var order = await FetchOrderAsync(client, orderId);
        if (order is null)
            return (false, 404, "Không tìm thấy đơn hàng");
        if (order.ShipperId != shipperId)
            return (false, 403, "Forbidden");

        var res = await client.PutAsJsonAsync($"/api/orders/{orderId}/status", new { status = "Delivered" });
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> ReturnOrderAsync(
        string token, int orderId, int shipperId)
    {
        var client = CreateClient(token);

        var order = await FetchOrderAsync(client, orderId);
        if (order is null)
            return (false, 404, "Không tìm thấy đơn hàng");
        if (order.ShipperId != shipperId)
            return (false, 403, "Forbidden");
        if (order.Status != "Delivering")
            return (false, 400, "Chỉ có thể hoàn hàng khi đang giao!");

        var res = await client.PutAsJsonAsync($"/api/orders/{orderId}/status", new { status = "Returned" });
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    // ══════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════

    private HttpClient CreateClient(string token)
    {
        var client = _http.CreateClient("OrderServiceClient");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private async Task<(bool Success, int StatusCode, List<OrderDto>? Data)> FetchAllOrdersAsync(string token)
    {
        var res = await CreateClient(token).GetAsync("/api/orders");
        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode) return (false, (int)res.StatusCode, null);
        var orders = JsonSerializer.Deserialize<List<OrderDto>>(body, _json) ?? [];
        return (true, 200, orders);
    }

    private async Task<OrderDto?> FetchOrderAsync(HttpClient client, int orderId)
    {
        var res = await client.GetAsync($"/api/orders/{orderId}");
        var body = await res.Content.ReadAsStringAsync();
        return res.IsSuccessStatusCode
            ? JsonSerializer.Deserialize<OrderDto>(body, _json)
            : null;
    }
}