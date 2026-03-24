using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserService.DTOs;
using UserService.Middlewares;
using UserService.Models;
using UserService.Repositories;

namespace UserService.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IConfiguration _config;

    public UserService(IUserRepository repo, IConfiguration config)
    {
        _repo = repo;
        _config = config;
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllAsync()
    {
        var users = await _repo.GetAllAsync();
        return users.Select(MapToResponse);
    }

    public async Task<UserResponseDto> GetByIdAsync(int id)
    {
        var user = await _repo.GetByIdAsync(id);
        if (user is null)
            throw new NotFoundException($"Không tìm thấy user với Id = {id}");
        return MapToResponse(user);
    }

    // ← MỚI: batch lookup cho OrderService
    public async Task<IEnumerable<UserResponseDto>> GetByIdsAsync(IEnumerable<int> ids)
    {
        var users = await _repo.GetByIdsAsync(ids);
        return users.Select(MapToResponse);
    }

    public async Task<UserResponseDto> CreateAsync(CreateUserDto dto)
    {
        var existing = await _repo.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new BadRequestException($"Email '{dto.Email}' đã được sử dụng!");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = HashPassword(dto.Password)
        };
        var created = await _repo.CreateAsync(user);
        return MapToResponse(created);
    }

    public async Task<UserResponseDto> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = new User { Name = dto.Name, Email = dto.Email };
        var updated = await _repo.UpdateAsync(id, user);
        if (updated is null)
            throw new NotFoundException($"Không tìm thấy user với Id = {id}");
        return MapToResponse(updated);
    }

    public async Task DeleteAsync(int id)
    {
        var result = await _repo.DeleteAsync(id);
        if (!result)
            throw new NotFoundException($"Không tìm thấy user với Id = {id}");
    }

    public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _repo.GetByEmailAsync(dto.Email);
        if (user is null || !VerifyPassword(dto.Password, user.Password))
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng!");

        return new TokenResponseDto
        {
            Token = GenerateToken(user),
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
    }

    // ─── Helpers ───────────────────────────────────────────

    private static UserResponseDto MapToResponse(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        CreatedAt = user.CreatedAt
    };

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private static bool VerifyPassword(string password, string hashed)
        => HashPassword(password) == hashed;

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}