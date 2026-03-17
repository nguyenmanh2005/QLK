using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Security.Claims;
using SellerService.DTOs;

namespace SellerService.Controllers;

[ApiController]
[Route("api/seller/products")]
[Authorize(Roles = "Seller")]
public class ProductsController : ControllerBase
{
    private readonly IHttpClientFactory _http;
    public ProductsController(IHttpClientFactory http) => _http = http;

    private int GetSellerId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Tạo client với token của seller truyền sang ProductService
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
        var sellerId = GetSellerId();
        var client   = GetProductClient();
        var res      = await client.GetAsync($"/api/products/seller/{sellerId}");
        var data     = await res.Content.ReadAsStringAsync();
        return Content(data, "application/json");
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        dto.SellerId = GetSellerId();
        var client   = GetProductClient();
        var res      = await client.PostAsJsonAsync("/api/products", dto);

        if (!res.IsSuccessStatusCode)
        {
            var err = await res.Content.ReadAsStringAsync();
            return StatusCode((int)res.StatusCode, err);
        }

        var data = await res.Content.ReadAsStringAsync();
        return Content(data, "application/json");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        dto.SellerId = GetSellerId();
        var client   = GetProductClient();
        var res      = await client.PutAsJsonAsync($"/api/products/{id}", dto);

        if (!res.IsSuccessStatusCode)
        {
            var err = await res.Content.ReadAsStringAsync();
            return StatusCode((int)res.StatusCode, err);
        }

        var data = await res.Content.ReadAsStringAsync();
        return Content(data, "application/json");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sellerId  = GetSellerId();
        var client    = GetProductClient();

        var checkRes  = await client.GetAsync($"/api/products/{id}");
        if (!checkRes.IsSuccessStatusCode) return NotFound();

        var checkData = await checkRes.Content.ReadFromJsonAsync<ProductDto>();
        if (checkData?.SellerId != sellerId) return Forbid();

        var res = await client.DeleteAsync($"/api/products/{id}");
        return res.IsSuccessStatusCode ? NoContent() : BadRequest();
    }
}