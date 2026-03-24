using UserService.DTOs;

namespace UserService.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto> GetByIdAsync(int id);
    Task<IEnumerable<UserResponseDto>> GetByIdsAsync(IEnumerable<int> ids); // ← MỚI
    Task<UserResponseDto> CreateAsync(CreateUserDto dto);
    Task<UserResponseDto> UpdateAsync(int id, UpdateUserDto dto);
    Task DeleteAsync(int id);
    Task<TokenResponseDto> LoginAsync(LoginDto dto);
}