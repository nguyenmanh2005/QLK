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

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateShipperDto dto)
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