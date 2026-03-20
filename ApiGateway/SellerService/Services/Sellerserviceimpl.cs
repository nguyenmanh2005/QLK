using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SellerService.DTOs;
using SellerService.Models;
using SellerService.Repositories;
using SellerService.Services.Interface;

namespace SellerService.Services;

public class SellerServiceImpl : ISellerService
{
    private readonly ISellerRepository _repo;
    private readonly IConfiguration _config;

    public SellerServiceImpl(ISellerRepository repo, IConfiguration config)
    {
        _repo = repo;
        _config = config;
    }

    // ══════════════════════════════════════════
    // AUTH
    // ══════════════════════════════════════════

    public async Task<SellerResponseDto> RegisterAsync(RegisterSellerDto dto)
    {
        var existing = await _repo.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new Exception("Email đã tồn tại!");

        var seller = new Seller
        {
            Name     = dto.Name,
            Email    = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        };

        var created = await _repo.CreateAsync(seller);
        return ToDto(created);
    }

    public async Task<string> LoginAsync(LoginSellerDto dto)
    {
        var seller = await _repo.GetByEmailAsync(dto.Email);
        if (seller is null || !BCrypt.Net.BCrypt.Verify(dto.Password, seller.Password))
            throw new Exception("Email hoặc mật khẩu không đúng!");

        return GenerateToken(seller);
    }

    // ══════════════════════════════════════════
    // CRUD
    // ══════════════════════════════════════════

    public async Task<IEnumerable<SellerResponseDto>> GetAllAsync()
    {
        var sellers = await _repo.GetAllAsync();
        return sellers.Select(ToDto);
    }

    public async Task<SellerResponseDto?> GetByIdAsync(int id)
    {
        var seller = await _repo.GetByIdAsync(id);
        return seller is null ? null : ToDto(seller);
    }

    public async Task<SellerResponseDto?> UpdateAsync(int id, UpdateSellerDto dto)
    {
        var seller = await _repo.GetByIdAsync(id);
        if (seller is null) return null;

        seller.Name  = dto.Name;
        seller.Email = dto.Email;

        if (!string.IsNullOrEmpty(dto.Password))
            seller.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _repo.UpdateAsync(seller);
        return ToDto(seller);
    }

    public Task<bool> DeleteAsync(int id)
        => _repo.DeleteAsync(id);

    // ══════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════

    private string GenerateToken(Seller seller)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, seller.Id.ToString()),
            new Claim(ClaimTypes.Name,           seller.Name),
            new Claim(ClaimTypes.Email,          seller.Email),
            new Claim(ClaimTypes.Role,           "Seller"),
        };

        var token = new JwtSecurityToken(
            issuer:            _config["Jwt:Issuer"],
            audience:          _config["Jwt:Audience"],
            claims:            claims,
            expires:           DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // ─── Map Seller → DTO kèm QR fields ──────────────────
    private static SellerResponseDto ToDto(Seller s) => new()
    {
        Id          = s.Id,
        Name        = s.Name,
        Email       = s.Email,
        CreatedAt   = s.CreatedAt,
        BankCode    = s.BankCode,
        AccountNo   = s.AccountNo,
        AccountName = s.AccountName,
        QrStatus    = s.QrStatus.ToString(),
    };
}