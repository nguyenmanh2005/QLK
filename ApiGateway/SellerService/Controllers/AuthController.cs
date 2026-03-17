using Microsoft.AspNetCore.Mvc;
using SellerService.DTOs;
using SellerService.Repositories;
using SellerService.Services;

namespace SellerService.Controllers;

[ApiController]
[Route("api/seller")]
public class AuthController : ControllerBase
{
    private readonly ISellerService    _service;
    private readonly ISellerRepository _repo;

    public AuthController(ISellerService service, ISellerRepository repo)
    {
        _service = service;
        _repo    = repo;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterSellerDto dto)
        => Ok(await _service.RegisterAsync(dto));

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginSellerDto dto)
        => Ok(new { token = await _service.LoginAsync(dto) });

    [HttpGet("list")]
    public async Task<IActionResult> GetAll()
    {
        var sellers = await _repo.GetAllAsync();
        return Ok(sellers.Select(s => new SellerResponseDto
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
        var seller = await _repo.GetByIdAsync(id);
        if (seller is null) return NotFound();
        return Ok(new SellerResponseDto
        {
            Id        = seller.Id,
            Name      = seller.Name,
            Email     = seller.Email,
            CreatedAt = seller.CreatedAt,
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateSellerDto dto)
    {
        var seller = await _repo.GetByIdAsync(id);
        if (seller is null) return NotFound();

        seller.Name  = dto.Name;
        seller.Email = dto.Email;
        if (!string.IsNullOrEmpty(dto.Password))
            seller.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _repo.UpdateAsync(seller);
        return Ok(new SellerResponseDto
        {
            Id        = seller.Id,
            Name      = seller.Name,
            Email     = seller.Email,
            CreatedAt = seller.CreatedAt,
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