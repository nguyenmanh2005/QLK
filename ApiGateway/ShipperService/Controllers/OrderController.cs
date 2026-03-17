using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using ShipperService.DTOs;

namespace ShipperService.Controllers;

[ApiController]
[Route("api/shipper/orders")]
[Authorize(Roles = "Shipper")]
public class OrdersController : ControllerBase
{
    private readonly IHttpClientFactory _http;
    public OrdersController(IHttpClientFactory http) => _http = http;

    private static readonly JsonSerializerOptions _json =
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

    private HttpClient GetOrderClient()
    {
        var client = _http.CreateClient("OrderServiceClient");
        var token  = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private int GetShipperId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Danh sách đơn Shipping chờ shipper nhận
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable()
    {
        var client = GetOrderClient();
        var res    = await client.GetAsync("/api/orders");
        var body   = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, body);

        var orders   = JsonSerializer.Deserialize<List<OrderDto>>(body, _json) ?? [];
        var filtered = orders
            .Where(o => o.Status == "Shipping" && o.ShipperId == null)
            .ToList();
        return Ok(filtered);
    }

    // Đơn shipper đang giao (Delivering)
    [HttpGet("my-delivering")]
    public async Task<IActionResult> GetMyDelivering()
    {
        var shipperId = GetShipperId();
        var client    = GetOrderClient();
        var res       = await client.GetAsync("/api/orders");
        var body      = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, body);

        var orders   = JsonSerializer.Deserialize<List<OrderDto>>(body, _json) ?? [];
        var filtered = orders
            .Where(o => o.Status == "Delivering" && o.ShipperId == shipperId)
            .ToList();
        return Ok(filtered);
    }

    // Lịch sử đã giao
    [HttpGet("my-delivered")]
    public async Task<IActionResult> GetMyDelivered()
    {
        var shipperId = GetShipperId();
        var client    = GetOrderClient();
        var res       = await client.GetAsync("/api/orders");
        var body      = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, body);

        var orders   = JsonSerializer.Deserialize<List<OrderDto>>(body, _json) ?? [];
        var filtered = orders
            .Where(o => o.Status == "Delivered" && o.ShipperId == shipperId)
            .ToList();
        return Ok(filtered);
    }

    // Nhận đơn
    [HttpPatch("{id}/assign")]
    public async Task<IActionResult> Assign(int id)
    {
        var shipperId = GetShipperId();
        var client    = GetOrderClient();
        var res       = await client.PatchAsJsonAsync(
            $"/api/orders/{id}/assign-shipper",
            new { shipperId });
        var data = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, data);

        return Content(data, "application/json");
    }

    // Xác nhận đã giao
    [HttpPut("{id}/delivered")]
    public async Task<IActionResult> ConfirmDelivered(int id)
    {
        var shipperId = GetShipperId();
        var client    = GetOrderClient();

        // Kiểm tra đơn có thuộc shipper này không
        var checkRes  = await client.GetAsync($"/api/orders/{id}");
        var checkBody = await checkRes.Content.ReadAsStringAsync();
        var order     = JsonSerializer.Deserialize<OrderDto>(checkBody, _json);

        if (order?.ShipperId != shipperId)
            return Forbid();

        var res  = await client.PutAsJsonAsync(
            $"/api/orders/{id}/status",
            new { status = "Delivered" });
        var data = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, data);

        return Content(data, "application/json");
    }
}