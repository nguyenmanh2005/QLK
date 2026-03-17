using ShipperService.DTOs;

namespace ShipperService.Services;

public interface IShipperService
{
    Task<ShipperResponseDto> RegisterAsync(RegisterShipperDto dto);
    Task<string>             LoginAsync(LoginShipperDto dto);
}