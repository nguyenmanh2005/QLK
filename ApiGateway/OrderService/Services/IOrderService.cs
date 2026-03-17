using OrderService.DTOs;

namespace OrderService.Services;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDto>> GetAllAsync();
    Task<OrderResponseDto>              GetByIdAsync(int id);
    Task<IEnumerable<OrderResponseDto>> GetByUserIdAsync(int userId);
    Task<OrderResponseDto>              CreateAsync(CreateOrderDto dto);
    Task<OrderResponseDto>              UpdateStatusAsync(int id, UpdateOrderStatusDto dto);
    Task<OrderResponseDto>              AssignShipperAsync(int id, AssignShipperDto dto);
    Task<OrderResponseDto>              CancelAsync(int id);
    Task                                DeleteAsync(int id);
}