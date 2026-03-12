using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserService.DTOs;
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

    public async Task<UserResponseDto?> GetByIdAsync(int id)
    {
        var user = await _repo.GetByIdAsync(id);
        return user is null ? null : MapToResponse(user);
    }

    public async Task<UserResponseDto> CreateAsync(CreateUserDto dto)
    {
        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = HashPassword(dto.Password)
        };
        var created = await _repo.CreateAsync(user);
        return MapToResponse(created);
    }

    public async Task<UserResponseDto?> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = new User { Name = dto.Name, Email = dto.Email };
        var updated = await _repo.UpdateAsync(id, user);
        return updated is null ? null : MapToResponse(updated);
    }

    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);

    public async Task<TokenResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _repo.GetByEmailAsync(dto.Email);
        if (user is null || !VerifyPassword(dto.Password, user.Password))
            return null;

        var token = GenerateToken(user);
        return new TokenResponseDto
        {
            Token = token,
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
