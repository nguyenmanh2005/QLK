using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AdminService.DTOs;
using AdminService.Services.Interfaces;

namespace AdminService.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserAdminService _users;
    private readonly ISellerAdminService _sellers;
    private readonly IShipperAdminService _shippers;

    public UsersController(
        IUserAdminService users,
        ISellerAdminService sellers,
        IShipperAdminService shippers)
    {
        _users = users;
        _sellers = sellers;
        _shippers = shippers;
    }

    private string Token =>
        Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

    // ══════════════════════════════════════════
    // USERS
    // ══════════════════════════════════════════

    [HttpGet("api/admin/users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var (_, _, body) = await _users.GetAllAsync(Token);
        return Content(body, "application/json");
    }

    [HttpPost("api/admin/users")]
    public async Task<IActionResult> CreateUser(CreatePersonDto dto)
    {
        var (ok, status, body) = await _users.CreateAsync(Token, dto);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpPut("api/admin/users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, UpdatePersonDto dto)
    {
        var (ok, status, body) = await _users.UpdateAsync(Token, id, dto);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpDelete("api/admin/users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var (ok, status, body) = await _users.DeleteAsync(Token, id);
        return ok ? NoContent() : StatusCode(status, body);
    }

    // ══════════════════════════════════════════
    // SELLERS
    // ══════════════════════════════════════════

    [HttpGet("api/admin/sellers")]
    public async Task<IActionResult> GetAllSellers()
    {
        var (_, _, body) = await _sellers.GetAllAsync(Token);
        return Content(body, "application/json");
    }

    [HttpPost("api/admin/sellers")]
    public async Task<IActionResult> CreateSeller(CreatePersonDto dto)
    {
        var (ok, status, body) = await _sellers.CreateAsync(Token, dto);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpPut("api/admin/sellers/{id}")]
    public async Task<IActionResult> UpdateSeller(int id, UpdatePersonDto dto)
    {
        var (ok, status, body) = await _sellers.UpdateAsync(Token, id, dto);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpDelete("api/admin/sellers/{id}")]
    public async Task<IActionResult> DeleteSeller(int id)
    {
        var (ok, status, body) = await _sellers.DeleteAsync(Token, id);
        return ok ? NoContent() : StatusCode(status, body);
    }

    // ══════════════════════════════════════════
    // SHIPPERS
    // ══════════════════════════════════════════

    [HttpGet("api/admin/shippers")]
    public async Task<IActionResult> GetAllShippers()
    {
        var (_, _, body) = await _shippers.GetAllAsync(Token);
        return Content(body, "application/json");
    }

    [HttpPost("api/admin/shippers")]
    public async Task<IActionResult> CreateShipper(CreatePersonDto dto)
    {
        var (ok, status, body) = await _shippers.CreateAsync(Token, dto);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpPut("api/admin/shippers/{id}")]
    public async Task<IActionResult> UpdateShipper(int id, UpdatePersonDto dto)
    {
        var (ok, status, body) = await _shippers.UpdateAsync(Token, id, dto);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpDelete("api/admin/shippers/{id}")]
    public async Task<IActionResult> DeleteShipper(int id)
    {
        var (ok, status, body) = await _shippers.DeleteAsync(Token, id);
        return ok ? NoContent() : StatusCode(status, body);
    }
}