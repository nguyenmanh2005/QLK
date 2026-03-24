using ShipperService.DTOs;

namespace ShipperService.Services.Interface;

public interface IShipperService
{
    Task<ShipperResponseDto> RegisterAsync(RegisterShipperDto dto);
    Task<string> LoginAsync(LoginShipperDto dto);
    Task<IEnumerable<ShipperResponseDto>> GetAllAsync();
    Task<ShipperResponseDto?> GetByIdAsync(int id);
    Task<ShipperResponseDto?> UpdateAsync(int id, UpdateShipperDto dto);
    Task<bool> DeleteAsync(int id);
}