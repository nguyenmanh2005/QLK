using ShipperService.DTOs;

namespace ShipperService.Services.Interface;

public interface IShipperOrderService
{
    Task<(bool Success, int StatusCode, object Data)> GetAvailableAsync(string token);
    Task<(bool Success, int StatusCode, object Data)> GetMyDeliveringAsync(string token, int shipperId);
    Task<(bool Success, int StatusCode, object Data)> GetMyDeliveredAsync(string token, int shipperId);
    Task<(bool Success, int StatusCode, string Body)> AssignAsync(string token, int orderId, int shipperId);
    Task<(bool Success, int StatusCode, string Body)> ConfirmDeliveredAsync(string token, int orderId, int shipperId);
    Task<(bool Success, int StatusCode, string Body)> ReturnOrderAsync(string token, int orderId, int shipperId);
}