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

    public async Task<ShipperResponseDto?> UpdateProfileAsync(int id, UpdateProfileDto dto)
    {
        var shipper = await _repo.GetByIdAsync(id);
        if (shipper is null) return null;

        shipper.Name = dto.Name;
        shipper.PhoneNumber = dto.PhoneNumber;
        if (dto.Latitude.HasValue) shipper.Latitude = dto.Latitude.Value;
        if (dto.Longitude.HasValue) shipper.Longitude = dto.Longitude.Value;

        await _repo.UpdateAsync(shipper);
        return ToDto(shipper);
    }

    public async Task<ShipperResponseDto?> UpdateAsync(int id, UpdateShipperDto dto)
    {
        var shipper = await _repo.GetByIdAsync(id);
        if (shipper is null) return null;

        shipper.Name = dto.Name;
        shipper.Email = dto.Email;
        shipper.PhoneNumber = dto.PhoneNumber;
        if (dto.Latitude.HasValue) shipper.Latitude = dto.Latitude.Value;
        if (dto.Longitude.HasValue) shipper.Longitude = dto.Longitude.Value;

        if (!string.IsNullOrEmpty(dto.Password))
            shipper.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _repo.UpdateAsync(shipper);
        return ToDto(shipper);
    }

    public Task<bool> DeleteAsync(int id)
        => _repo.DeleteAsync(id);

    public async Task<ShipperReview> CreateReviewAsync(int userId, CreateShipperReviewDto dto)
    {
        var review = new ShipperReview
        {
            ShipperId = dto.ShipperId,
            UserId = userId,
            OrderId = dto.OrderId,
            Rating = dto.Rating,
            Comment = dto.Comment
        };
        return await _repo.CreateReviewAsync(review);
    }

    public async Task<ShipperRatingDto> GetRatingAsync(int shipperId)
    {
        var stats = await _repo.GetRatingStatsAsync(shipperId);
        return new ShipperRatingDto
        {
            ShipperId = shipperId,
            AverageRating = stats.Average,
            TotalReviews = stats.Total
        };
    }

    public async Task<ShipperResponseDto?> UpdateLocationAsync(int id, UpdateLocationDto dto)
    {
        var shipper = await _repo.GetByIdAsync(id);
        if (shipper is null) return null;

        shipper.Latitude = dto.Latitude;
        shipper.Longitude = dto.Longitude;

        await _repo.UpdateAsync(shipper);
        return ToDto(shipper);
    }

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
        PhoneNumber = s.PhoneNumber,
        Latitude = s.Latitude,
        Longitude = s.Longitude,
        CreatedAt = s.CreatedAt,
    };
}