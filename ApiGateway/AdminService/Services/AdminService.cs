using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using AdminService.DTOs;
using AdminService.Models;
using AdminService.Repositories;

namespace AdminService.Services;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _repo;
    private readonly IConfiguration   _config;

    public AdminService(IAdminRepository repo, IConfiguration config)
    {
        _repo   = repo;
        _config = config;
    }

    public async Task<AdminResponseDto> RegisterAsync(RegisterAdminDto dto)
    {
        var existing = await _repo.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new Exception("Email đã tồn tại!");

        var admin = new Admin
        {
            Name     = dto.Name,
            Email    = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        };

        var created = await _repo.CreateAsync(admin);
        return new AdminResponseDto
        {
            Id        = created.Id,
            Name      = created.Name,
            Email     = created.Email,
            CreatedAt = created.CreatedAt,
        };
    }

    public async Task<string> LoginAsync(LoginAdminDto dto)
    {
        var admin = await _repo.GetByEmailAsync(dto.Email);
        if (admin == null || !BCrypt.Net.BCrypt.Verify(dto.Password, admin.Password))
            throw new Exception("Email hoặc mật khẩu không đúng!");

        return GenerateToken(admin);
    }

    private string GenerateToken(Admin admin)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new Claim(ClaimTypes.Name,           admin.Name),
            new Claim(ClaimTypes.Email,          admin.Email),
            new Claim(ClaimTypes.Role,           "Admin"),
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