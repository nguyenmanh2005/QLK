using SellerService.DTOs;

namespace SellerService.Services;

public interface ISellerService
{
    Task<SellerResponseDto> RegisterAsync(RegisterSellerDto dto);
    Task<string> LoginAsync(LoginSellerDto dto);
}