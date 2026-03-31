using ShipperService.DTOs;

namespace ShipperService.Services.Interface;

public interface IShipperService
{
    Task<ShipperResponseDto> RegisterAsync(RegisterShipperDto dto);
    Task<string> LoginAsync(LoginShipperDto dto);
    Task<IEnumerable<ShipperResponseDto>> GetAllAsync();
    Task<ShipperResponseDto?> GetByIdAsync(int id);
    Task<ShipperResponseDto?> UpdateProfileAsync(int id, UpdateProfileDto dto);
    Task<ShipperResponseDto?> UpdateAsync(int id, UpdateShipperDto dto);
    Task<bool> DeleteAsync(int id);
    Task<Models.ShipperReview> CreateReviewAsync(int userId, CreateShipperReviewDto dto);
    Task<ShipperRatingDto> GetRatingAsync(int shipperId);
    Task<ShipperResponseDto?> UpdateLocationAsync(int id, UpdateLocationDto dto);
}