// ═══════════════════════════════════════════════════════════
// IOrderService.cs
// ═══════════════════════════════════════════════════════════
using OrderService.DTOs;
using OrderService.HttpClients;
using OrderService.Models;
using OrderService.Repositories;

namespace OrderService.Services;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDto>> GetAllAsync();
    Task<OrderResponseDto> GetByIdAsync(int id);
    Task<IEnumerable<OrderResponseDto>> GetByUserIdAsync(int userId);
    Task<OrderResponseDto> CreateAsync(CreateOrderDto dto);
    Task<OrderResponseDto> UpdateStatusAsync(int id, UpdateOrderStatusDto dto);
    Task DeleteAsync(int id);
}