using SellerService.DTOs;

namespace SellerService.Services.Interface;

public interface ISellerService
{
    Task<SellerResponseDto> RegisterAsync(RegisterSellerDto dto);
    Task<string> LoginAsync(LoginSellerDto dto);
    Task<IEnumerable<SellerResponseDto>> GetAllAsync();
    Task<SellerResponseDto?> GetByIdAsync(int id);
    Task<SellerResponseDto?> UpdateProfileAsync(int id, UpdateProfileDto dto);
    Task<SellerResponseDto?> UpdateAsync(int id, UpdateSellerDto dto);
    Task<bool> DeleteAsync(int id);
}