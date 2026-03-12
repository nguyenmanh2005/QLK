using UserService.DTOs;
using UserService.Models;

namespace UserService.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto?> GetByIdAsync(int id);
    Task<UserResponseDto> CreateAsync(CreateUserDto dto);
    Task<UserResponseDto?> UpdateAsync(int id, UpdateUserDto dto);
    Task<bool> DeleteAsync(int id);
    Task<TokenResponseDto?> LoginAsync(LoginDto dto);
}
