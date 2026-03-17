using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using AdminService.DTOs;

namespace AdminService.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IHttpClientFactory _http;
    private readonly IConfiguration     _config;

    private static readonly JsonSerializerOptions _json =
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

    public UsersController(IHttpClientFactory http, IConfiguration config)
    {
        _http   = http;
        _config = config;
    }

    private HttpClient GetClient(string name)
    {
        var client = _http.CreateClient(name);
        var token  = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    // ══════════════════════════════════════════
    // USERS
    // ══════════════════════════════════════════

    [HttpGet("api/admin/users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var res  = await GetClient("UserServiceClient").GetAsync("/api/users");
        var body = await res.Content.ReadAsStringAsync();
        return Content(body, "application/json");
    }

    [HttpPost("api/admin/users")]
    public async Task<IActionResult> CreateUser(CreatePersonDto dto)
    {
        var client = GetClient("UserServiceClient");
        var res    = await client.PostAsJsonAsync("/api/users", new
        {
            name     = dto.Name,
            email    = dto.Email,
            password = dto.Password,
        });
        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode) return StatusCode((int)res.StatusCode, body);
        return Content(body, "application/json");
    }

    [HttpPut("api/admin/users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, UpdatePersonDto dto)
    {
        var client = GetClient("UserServiceClient");
        var res    = await client.PutAsJsonAsync($"/api/users/{id}", new
        {
            name  = dto.Name,
            email = dto.Email,
        });
        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode) return StatusCode((int)res.StatusCode, body);
        return Content(body, "application/json");
    }

    [HttpDelete("api/admin/users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var res = await GetClient("UserServiceClient").DeleteAsync($"/api/users/{id}");
        if (!res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, await res.Content.ReadAsStringAsync());
        return NoContent();
    }

    // ══════════════════════════════════════════
    // SELLERS
    // ══════════════════════════════════════════

    [HttpGet("api/admin/sellers")]
    public async Task<IActionResult> GetAllSellers()
    {
        var res  = await GetClient("SellerServiceClient").GetAsync("/api/seller/list");
        var body = await res.Content.ReadAsStringAsync();
        return Content(body, "application/json");
    }

    [HttpPost("api/admin/sellers")]
    public async Task<IActionResult> CreateSeller(CreatePersonDto dto)
    {
        var client = GetClient("SellerServiceClient");
        var res    = await client.PostAsJsonAsync("/api/seller/register", new
        {
            name     = dto.Name,
            email    = dto.Email,
            password = dto.Password,
        });
        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode) return StatusCode((int)res.StatusCode, body);
        return Content(body, "application/json");
    }

    [HttpPut("api/admin/sellers/{id}")]
    public async Task<IActionResult> UpdateSeller(int id, UpdatePersonDto dto)
    {
        var client = GetClient("SellerServiceClient");
        var res    = await client.PutAsJsonAsync($"/api/seller/{id}", new
        {
            name     = dto.Name,
            email    = dto.Email,
            password = dto.Password,
        });
        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode) return StatusCode((int)res.StatusCode, body);
        return Content(body, "application/json");
    }

    [HttpDelete("api/admin/sellers/{id}")]
    public async Task<IActionResult> DeleteSeller(int id)
    {
        var res = await GetClient("SellerServiceClient").DeleteAsync($"/api/seller/{id}");
        if (!res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, await res.Content.ReadAsStringAsync());
        return NoContent();
    }

    // ══════════════════════════════════════════
    // SHIPPERS
    // ══════════════════════════════════════════

    [HttpGet("api/admin/shippers")]
    public async Task<IActionResult> GetAllShippers()
    {
        var res  = await GetClient("ShipperServiceClient").GetAsync("/api/shipper/list");
        var body = await res.Content.ReadAsStringAsync();
        return Content(body, "application/json");
    }

    [HttpPost("api/admin/shippers")]
    public async Task<IActionResult> CreateShipper(CreatePersonDto dto)
    {
        var client = GetClient("ShipperServiceClient");
        var res    = await client.PostAsJsonAsync("/api/shipper/register", new
        {
            name     = dto.Name,
            email    = dto.Email,
            password = dto.Password,
        });
        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode) return StatusCode((int)res.StatusCode, body);
        return Content(body, "application/json");
    }

    [HttpPut("api/admin/shippers/{id}")]
    public async Task<IActionResult> UpdateShipper(int id, UpdatePersonDto dto)
    {
        var client = GetClient("ShipperServiceClient");
        var res    = await client.PutAsJsonAsync($"/api/shipper/{id}", new
        {
            name     = dto.Name,
            email    = dto.Email,
            password = dto.Password,
        });
        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode) return StatusCode((int)res.StatusCode, body);
        return Content(body, "application/json");
    }

    [HttpDelete("api/admin/shippers/{id}")]
    public async Task<IActionResult> DeleteShipper(int id)
    {
        var res = await GetClient("ShipperServiceClient").DeleteAsync($"/api/shipper/{id}");
        if (!res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, await res.Content.ReadAsStringAsync());
        return NoContent();
    }
}