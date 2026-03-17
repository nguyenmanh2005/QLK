using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ShipperService.DTOs;
using ShipperService.Models;
using ShipperService.Repositories;

namespace ShipperService.Services;

public class ShipperService : IShipperService
{
    private readonly IShipperRepository _repo;
    private readonly IConfiguration     _config;

    public ShipperService(IShipperRepository repo, IConfiguration config)
    {
        _repo   = repo;
        _config = config;
    }

    public async Task<ShipperResponseDto> RegisterAsync(RegisterShipperDto dto)
    {
        var existing = await _repo.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new Exception("Email đã tồn tại!");

        var shipper = new Shipper
        {
            Name     = dto.Name,
            Email    = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        };

        var created = await _repo.CreateAsync(shipper);
        return new ShipperResponseDto
        {
            Id        = created.Id,
            Name      = created.Name,
            Email     = created.Email,
            CreatedAt = created.CreatedAt,
        };
    }

    public async Task<string> LoginAsync(LoginShipperDto dto)
    {
        var shipper = await _repo.GetByEmailAsync(dto.Email);
        if (shipper == null || !BCrypt.Net.BCrypt.Verify(dto.Password, shipper.Password))
            throw new Exception("Email hoặc mật khẩu không đúng!");

        return GenerateToken(shipper);
    }

    private string GenerateToken(Shipper shipper)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, shipper.Id.ToString()),
            new Claim(ClaimTypes.Name,           shipper.Name),
            new Claim(ClaimTypes.Email,          shipper.Email),
            new Claim(ClaimTypes.Role,           "Shipper"),
        };

        var token = new JwtSecurityToken(
            issuer:             _config["Jwt:Issuer"],
            audience:           _config["Jwt:Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}