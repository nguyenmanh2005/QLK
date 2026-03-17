using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Security.Claims;
using SellerService.DTOs;

namespace SellerService.Controllers;

[ApiController]
[Route("api/seller/orders")]
[Authorize(Roles = "Seller")]
public class OrdersController : ControllerBase
{
    private readonly IHttpClientFactory _http;

    public OrdersController(IHttpClientFactory http) => _http = http;

    private HttpClient GetOrderClient()
    {
        var client = _http.CreateClient("OrderServiceClient");
        var token  = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private HttpClient GetProductClient()
    {
        var client = _http.CreateClient("ProductServiceClient");
        var token  = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sellerId    = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var orderClient = GetOrderClient();
        var orderRes    = await orderClient.GetAsync("/api/orders");
        var orderBody   = await orderRes.Content.ReadAsStringAsync();

        if (!orderRes.IsSuccessStatusCode)
            return StatusCode((int)orderRes.StatusCode, orderBody);

        var orders = System.Text.Json.JsonSerializer.Deserialize<List<OrderDto>>(orderBody,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        var productClient    = GetProductClient();
        var productRes       = await productClient.GetAsync($"/api/products/seller/{sellerId}");
        var productBody      = await productRes.Content.ReadAsStringAsync();
        var products         = System.Text.Json.JsonSerializer.Deserialize<List<ProductDto>>(productBody,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        var sellerProductIds = products?.Select(p => p.Id).ToHashSet() ?? new HashSet<int>();

        var filtered = new List<object>();

        foreach (var order in orders ?? [])
        {
            int productId = order.Product?.Id ?? 0;

            if (productId == 0)
            {
                var detailRes  = await orderClient.GetAsync($"/api/orders/{order.Id}");
                var detailBody = await detailRes.Content.ReadAsStringAsync();
                var detail     = System.Text.Json.JsonSerializer.Deserialize<OrderDetailDto>(detailBody,
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                productId = detail?.ProductId ?? 0;
            }

            if (sellerProductIds.Contains(productId))
            {
                filtered.Add(new {
                    order.Id,
                    order.UserId,
                    ProductId   = productId,
                    ProductName = products?.FirstOrDefault(p => p.Id == productId)?.Name,
                    order.Quantity,
                    order.TotalPrice,
                    order.Status,
                    order.CreatedAt,
                });
            }
        }

        return Ok(filtered.OrderByDescending(o => ((dynamic)o).Id));
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        var allowed = new[] { "Packing", "Shipping" };
        if (!allowed.Contains(dto.Status))
            return BadRequest("Seller chỉ được cập nhật: Packing, Shipping!");

        var client = GetOrderClient();

        // Fix: đổi PatchAsJsonAsync → PutAsJsonAsync
        var res  = await client.PutAsJsonAsync($"/api/orders/{id}/status", dto);
        var data = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, data);

        return Content(data, "application/json");
    }
}