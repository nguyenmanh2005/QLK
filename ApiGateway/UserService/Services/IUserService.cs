// ═══════════════════════════════════════════════════════════
// IUserService.cs
// ═══════════════════════════════════════════════════════════
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserService.DTOs;
using UserService.Models;
using UserService.Repositories;

namespace UserService.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto> GetByIdAsync(int id);
    Task<UserResponseDto> CreateAsync(CreateUserDto dto);
    Task<UserResponseDto> UpdateAsync(int id, UpdateUserDto dto);
    Task DeleteAsync(int id);
    Task<TokenResponseDto> LoginAsync(LoginDto dto);
}