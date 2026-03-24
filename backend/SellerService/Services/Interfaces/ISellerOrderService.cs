using SellerService.DTOs;

namespace SellerService.Services.Interface;

public interface ISellerOrderService
{
    Task<(bool Success, int StatusCode, object Data)> GetSellerOrdersAsync(string token, int sellerId);
    Task<(bool Success, int StatusCode, string Body)> UpdateStatusAsync(string token, int orderId, UpdateOrderStatusDto dto);
}