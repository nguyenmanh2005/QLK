using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SellerService.DTOs;
using SellerService.Models;
using SellerService.Repositories;

namespace SellerService.Services;

public class SellerService : ISellerService
{
    private readonly ISellerRepository _repo;
    private readonly IConfiguration _config;

    public SellerService(ISellerRepository repo, IConfiguration config)
    {
        _repo = repo;
        _config = config;
    }

    public async Task<SellerResponseDto> RegisterAsync(RegisterSellerDto dto)
    {
        var existing = await _repo.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new Exception("Email đã tồn tại!");

        var seller = new Seller
        {
            Name     = dto.Name,
            Email    = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        };

        var created = await _repo.CreateAsync(seller);
        return new SellerResponseDto
        {
            Id        = created.Id,
            Name      = created.Name,
            Email     = created.Email,
            CreatedAt = created.CreatedAt,
        };
    }

    public async Task<string> LoginAsync(LoginSellerDto dto)
    {
        var seller = await _repo.GetByEmailAsync(dto.Email);
        if (seller == null || !BCrypt.Net.BCrypt.Verify(dto.Password, seller.Password))
            throw new Exception("Email hoặc mật khẩu không đúng!");

        return GenerateToken(seller);
    }

    private string GenerateToken(Seller seller)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, seller.Id.ToString()),
            new Claim(ClaimTypes.Name,  seller.Name),
            new Claim(ClaimTypes.Email, seller.Email),
            new Claim(ClaimTypes.Role,  "Seller"),
        };

        var token = new JwtSecurityToken(
            issuer:   _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims:   claims,
            expires:  DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}