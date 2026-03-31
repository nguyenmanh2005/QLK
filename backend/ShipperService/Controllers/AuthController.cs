using Microsoft.AspNetCore.Mvc;
using ShipperService.DTOs;
using ShipperService.Services.Interface;

namespace ShipperService.Controllers;

[ApiController]
[Route("api/shipper")]
public class AuthController : ControllerBase
{
    private readonly IShipperService _service;

    public AuthController(IShipperService service)
    {
        _service = service;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterShipperDto dto)
        => Ok(await _service.RegisterAsync(dto));

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginShipperDto dto)
        => Ok(new { token = await _service.LoginAsync(dto) });

    [HttpGet("list")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var shipper = await _service.GetByIdAsync(id);
        return shipper is null ? NotFound() : Ok(shipper);
    }

    [HttpPut("profile")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            return Unauthorized();

        var updated = await _service.UpdateProfileAsync(userId, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPut("{id}")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Update(int id, UpdateShipperDto dto)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId) || currentUserId != id)
            return Unauthorized("Bạn chỉ có quyền sửa thông tin của chính mình.");

        var updated = await _service.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPut("{id}/location")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> UpdateLocation(int id, UpdateLocationDto dto)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId) || currentUserId != id)
            return Unauthorized("Bạn chỉ có quyền cập nhật vị trí của chính mình.");

        var updated = await _service.UpdateLocationAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPut("admin/update/{id}")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminUpdate(int id, UpdateShipperDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}