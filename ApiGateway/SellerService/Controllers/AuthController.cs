using Microsoft.AspNetCore.Mvc;
using SellerService.DTOs;
using SellerService.Services.Interface;

namespace SellerService.Controllers;

[ApiController]
[Route("api/seller")]
public class AuthController : ControllerBase
{
    private readonly ISellerService _service;

    public AuthController(ISellerService service)
    {
        _service = service;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterSellerDto dto)
        => Ok(await _service.RegisterAsync(dto));

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginSellerDto dto)
        => Ok(new { token = await _service.LoginAsync(dto) });

    [HttpGet("list")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var seller = await _service.GetByIdAsync(id);
        return seller is null ? NotFound() : Ok(seller);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateSellerDto dto)
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