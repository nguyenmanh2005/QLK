using OrderService.DTOs;
using OrderService.HttpClients;
using OrderService.Models;
using OrderService.Repositories;

namespace OrderService.Services;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDto>> GetAllAsync();
    Task<OrderResponseDto?> GetByIdAsync(int id);
    Task<IEnumerable<OrderResponseDto>> GetByUserIdAsync(int userId);
    Task<OrderResponseDto> CreateAsync(CreateOrderDto dto);
    Task<OrderResponseDto?> UpdateStatusAsync(int id, UpdateOrderStatusDto dto);
    Task<bool> DeleteAsync(int id);
}

public class OrderService : IOrderService
{
    private readonly IOrderRepository _repo;
    private readonly UserServiceClient _userClient;
    private readonly ProductServiceClient _productClient;

    public OrderService(
        IOrderRepository repo,
        UserServiceClient userClient,
        ProductServiceClient productClient)
    {
        _repo = repo;
        _userClient = userClient;
        _productClient = productClient;
    }

    public async Task<IEnumerable<OrderResponseDto>> GetAllAsync()
    {
        var orders = await _repo.GetAllAsync();
        var result = new List<OrderResponseDto>();
        foreach (var order in orders)
            result.Add(await EnrichOrderAsync(order));
        return result;
    }

    public async Task<OrderResponseDto?> GetByIdAsync(int id)
    {
        var order = await _repo.GetByIdAsync(id);
        if (order is null) return null;
        return await EnrichOrderAsync(order);
    }

    public async Task<IEnumerable<OrderResponseDto>> GetByUserIdAsync(int userId)
    {
        var orders = await _repo.GetByUserIdAsync(userId);
        var result = new List<OrderResponseDto>();
        foreach (var order in orders)
            result.Add(await EnrichOrderAsync(order));
        return result;
    }

    public async Task<OrderResponseDto> CreateAsync(CreateOrderDto dto)
    {
        // Kiểm tra User tồn tại
        var user = await _userClient.GetUserByIdAsync(dto.UserId);
        if (user is null)
            throw new Exception($"User với Id = {dto.UserId} không tồn tại!");

        // Kiểm tra Product tồn tại
        var product = await _productClient.GetProductByIdAsync(dto.ProductId);
        if (product is null)
            throw new Exception($"Product với Id = {dto.ProductId} không tồn tại!");

        // Kiểm tra tồn kho
        if (product.Stock < dto.Quantity)
            throw new Exception($"Sản phẩm không đủ hàng! Còn lại: {product.Stock}");

        var order = new Order
        {
            UserId = dto.UserId,
            ProductId = dto.ProductId,
            ProductName = product.Name,
            Quantity = dto.Quantity,
            TotalPrice = product.Price * dto.Quantity,
            Status = "Pending"
        };

        var created = await _repo.CreateAsync(order);

        return new OrderResponseDto
        {
            Id = created.Id,
            Quantity = created.Quantity,
            TotalPrice = created.TotalPrice,
            Status = created.Status,
            CreatedAt = created.CreatedAt,
            User = user,
            Product = product
        };
    }

    public async Task<OrderResponseDto?> UpdateStatusAsync(int id, UpdateOrderStatusDto dto)
    {
        var validStatuses = new[] { "Pending", "Confirmed", "Cancelled" };
        if (!validStatuses.Contains(dto.Status))
            throw new Exception($"Status không hợp lệ! Chỉ chấp nhận: {string.Join(", ", validStatuses)}");

        var updated = await _repo.UpdateStatusAsync(id, dto.Status);
        if (updated is null) return null;
        return await EnrichOrderAsync(updated);
    }

    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);

    // ─── Helper: gắn thêm thông tin User và Product vào Order ───
    private async Task<OrderResponseDto> EnrichOrderAsync(Order order)
    {
        var user = await _userClient.GetUserByIdAsync(order.UserId);
        var product = await _productClient.GetProductByIdAsync(order.ProductId);

        return new OrderResponseDto
        {
            Id = order.Id,
            Quantity = order.Quantity,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            User = user,
            Product = product
        };
    }
}
