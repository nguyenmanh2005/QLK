using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ShipperService.DTOs;
using ShipperService.Models;
using ShipperService.Repositories;
using ShipperService.Services.Interface;

namespace ShipperService.Services;

public class ShipperServiceImpl : IShipperService
{
    private readonly IShipperRepository _repo;
    private readonly IConfiguration _config;

    public ShipperServiceImpl(IShipperRepository repo, IConfiguration config)
    {
        _repo = repo;
        _config = config;
    }

    // ══════════════════════════════════════════
    // AUTH
    // ══════════════════════════════════════════

    public async Task<ShipperResponseDto> RegisterAsync(RegisterShipperDto dto)
    {
        var existing = await _repo.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new Exception("Email đã tồn tại!");

        var shipper = new Shipper
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        };

        var created = await _repo.CreateAsync(shipper);
        return ToDto(created);
    }

    public async Task<string> LoginAsync(LoginShipperDto dto)
    {
        var shipper = await _repo.GetByEmailAsync(dto.Email);
        if (shipper is null || !BCrypt.Net.BCrypt.Verify(dto.Password, shipper.Password))
            throw new Exception("Email hoặc mật khẩu không đúng!");

        return GenerateToken(shipper);
    }

    // ══════════════════════════════════════════
    // CRUD
    // ══════════════════════════════════════════

    public async Task<IEnumerable<ShipperResponseDto>> GetAllAsync()
    {
        var shippers = await _repo.GetAllAsync();
        return shippers.Select(ToDto);
    }

    public async Task<ShipperResponseDto?> GetByIdAsync(int id)
    {
        var shipper = await _repo.GetByIdAsync(id);
        return shipper is null ? null : ToDto(shipper);
    }

    public async Task<ShipperResponseDto?> UpdateAsync(int id, UpdateShipperDto dto)
    {
        var shipper = await _repo.GetByIdAsync(id);
        if (shipper is null) return null;

        shipper.Name = dto.Name;
        shipper.Email = dto.Email;

        if (!string.IsNullOrEmpty(dto.Password))
            shipper.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _repo.UpdateAsync(shipper);
        return ToDto(shipper);
    }

    public Task<bool> DeleteAsync(int id)
        => _repo.DeleteAsync(id);

    // ══════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════

    private string GenerateToken(Shipper shipper)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, shipper.Id.ToString()),
            new Claim(ClaimTypes.Name,           shipper.Name),
            new Claim(ClaimTypes.Email,          shipper.Email),
            new Claim(ClaimTypes.Role,           "Shipper"),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static ShipperResponseDto ToDto(Shipper s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Email = s.Email,
        CreatedAt = s.CreatedAt,
    };
}