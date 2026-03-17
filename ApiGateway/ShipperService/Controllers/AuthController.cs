using Microsoft.AspNetCore.Mvc;
using ShipperService.DTOs;
using ShipperService.Repositories;
using ShipperService.Services;

namespace ShipperService.Controllers;

[ApiController]
[Route("api/shipper")]
public class AuthController : ControllerBase
{
    private readonly IShipperService    _service;
    private readonly IShipperRepository _repo;

    public AuthController(IShipperService service, IShipperRepository repo)
    {
        _service = service;
        _repo    = repo;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterShipperDto dto)
        => Ok(await _service.RegisterAsync(dto));

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginShipperDto dto)
        => Ok(new { token = await _service.LoginAsync(dto) });

    [HttpGet("list")]
    public async Task<IActionResult> GetAll()
    {
        var shippers = await _repo.GetAllAsync();
        return Ok(shippers.Select(s => new ShipperResponseDto
        {
            Id        = s.Id,
            Name      = s.Name,
            Email     = s.Email,
            CreatedAt = s.CreatedAt,
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var shipper = await _repo.GetByIdAsync(id);
        if (shipper is null) return NotFound();
        return Ok(new ShipperResponseDto
        {
            Id        = shipper.Id,
            Name      = shipper.Name,
            Email     = shipper.Email,
            CreatedAt = shipper.CreatedAt,
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateShipperDto dto)
    {
        var shipper = await _repo.GetByIdAsync(id);
        if (shipper is null) return NotFound();

        shipper.Name  = dto.Name;
        shipper.Email = dto.Email;
        if (!string.IsNullOrEmpty(dto.Password))
            shipper.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _repo.UpdateAsync(shipper);
        return Ok(new ShipperResponseDto
        {
            Id        = shipper.Id,
            Name      = shipper.Name,
            Email     = shipper.Email,
            CreatedAt = shipper.CreatedAt,
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _repo.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}