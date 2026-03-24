using OrderService.DTOs;
using OrderService.HttpClients;
using OrderService.Middlewares;
using OrderService.Models;
using OrderService.Repositories;

namespace OrderService.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository     _repo;
    private readonly UserServiceClient    _userClient;
    private readonly ProductServiceClient _productClient;
    private readonly MassTransit.IPublishEndpoint _publishEndpoint;

    public OrderService(
        IOrderRepository repo,
        UserServiceClient userClient,
        ProductServiceClient productClient,
        MassTransit.IPublishEndpoint publishEndpoint)
    {
        _repo          = repo;
        _userClient    = userClient;
        _productClient = productClient;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<IEnumerable<OrderResponseDto>> GetAllAsync()
    {
        var orders = (await _repo.GetAllAsync()).ToList();
        if (!orders.Any()) return Enumerable.Empty<OrderResponseDto>();

        var userIds    = orders.Select(o => o.UserId).Distinct();
        var productIds = orders.Select(o => o.ProductId).Distinct();

        var usersTask    = _userClient.GetUsersByIdsAsync(userIds);
        var productsTask = _productClient.GetProductsByIdsAsync(productIds);
        await Task.WhenAll(usersTask, productsTask);

        var userMap    = await usersTask;
        var productMap = await productsTask;

        return orders.Select(o => new OrderResponseDto
        {
            Id         = o.Id,
            UserId     = o.UserId,
            ProductId  = o.ProductId,
            Quantity   = o.Quantity,
            TotalPrice = o.TotalPrice,
            Status     = o.Status,
            ShipperId  = o.ShipperId,
            CreatedAt  = o.CreatedAt,
            User       = userMap.GetValueOrDefault(o.UserId),
            Product    = productMap.GetValueOrDefault(o.ProductId),
        });
    }

    public async Task<OrderResponseDto> GetByIdAsync(int id)
    {
        var order = await _repo.GetByIdAsync(id);
        if (order is null)
            throw new NotFoundException($"Không tìm thấy order với Id = {id}");
        return await EnrichOrderAsync(order);
    }

    public async Task<IEnumerable<OrderResponseDto>> GetByUserIdAsync(int userId)
    {
        var orders = (await _repo.GetByUserIdAsync(userId)).ToList();
        if (!orders.Any()) return Enumerable.Empty<OrderResponseDto>();

        var productIds = orders.Select(o => o.ProductId).Distinct();

        var userTask       = _userClient.GetUserByIdAsync(userId);
        var productMapTask = _productClient.GetProductsByIdsAsync(productIds);
        await Task.WhenAll(userTask, productMapTask);

        var user       = await userTask;
        var productMap = await productMapTask;

        return orders.Select(o => new OrderResponseDto
        {
            Id         = o.Id,
            UserId     = o.UserId,
            ProductId  = o.ProductId,
            Quantity   = o.Quantity,
            TotalPrice = o.TotalPrice,
            Status     = o.Status,
            ShipperId  = o.ShipperId,
            CreatedAt  = o.CreatedAt,
            User       = user,
            Product    = productMap.GetValueOrDefault(o.ProductId),
        });
    }

    public async Task<OrderResponseDto> CreateAsync(CreateOrderDto dto)
    {
        var userTask    = _userClient.GetUserByIdAsync(dto.UserId);
        var productTask = _productClient.GetProductByIdAsync(dto.ProductId);
        await Task.WhenAll(userTask, productTask);

        var user    = await userTask;
        var product = await productTask;

        if (user is null)
            throw new NotFoundException($"User với Id = {dto.UserId} không tồn tại!");
        if (product is null)
            throw new NotFoundException($"Product với Id = {dto.ProductId} không tồn tại!");
        if (product.Stock < dto.Quantity)
            throw new BadRequestException($"Sản phẩm không đủ hàng! Còn lại: {product.Stock}");

        var order = new Order
        {
            UserId      = dto.UserId,
            ProductId   = dto.ProductId,
            ProductName = product.Name,
            Quantity    = dto.Quantity,
            TotalPrice  = product.Price * dto.Quantity,
            Status      = "Pending"
        };

        var created = await _repo.CreateAsync(order);

        // Phát sóng sự kiện order mới tới RabbitMQ
        await _publishEndpoint.Publish(new Shared.Messages.Events.OrderCreatedEvent(created.ProductId, created.Quantity));

        return new OrderResponseDto
        {
            Id         = created.Id,
            UserId     = created.UserId,
            ProductId  = created.ProductId,
            Quantity   = created.Quantity,
            TotalPrice = created.TotalPrice,
            Status     = created.Status,
            ShipperId  = created.ShipperId,
            CreatedAt  = created.CreatedAt,
            User       = user,
            Product    = product
        };
    }

    public async Task<OrderResponseDto> UpdateStatusAsync(int id, UpdateOrderStatusDto dto)
    {
        // Thêm Returned vào validStatuses
        var validStatuses = new[]
            { "Pending", "Packing", "Shipping", "Delivering", "Delivered", "Cancelled", "Returned" };

        if (!validStatuses.Contains(dto.Status))
            throw new BadRequestException(
                $"Status không hợp lệ! Chỉ chấp nhận: {string.Join(", ", validStatuses)}");

        var updated = await _repo.UpdateStatusAsync(id, dto.Status);
        if (updated is null)
            throw new NotFoundException($"Không tìm thấy order với Id = {id}");

        return await EnrichOrderAsync(updated);
    }

    public async Task<OrderResponseDto> AssignShipperAsync(int id, AssignShipperDto dto)
    {
        var updated = await _repo.AssignShipperAsync(id, dto.ShipperId);
        if (updated is null)
            throw new BadRequestException(
                $"Không thể nhận đơn #{id}. Đơn phải ở trạng thái Shipping!");

        return await EnrichOrderAsync(updated);
    }

    public async Task<OrderResponseDto> CancelAsync(int id)
    {
        var order = await _repo.GetByIdAsync(id);
        if (order is null)
            throw new NotFoundException($"Không tìm thấy order với Id = {id}");

        var cancellableStatuses = new[] { "Pending", "Packing" };
        if (!cancellableStatuses.Contains(order.Status))
            throw new BadRequestException(
                $"Không thể hủy đơn #{id}. Chỉ hủy được khi đơn đang ở trạng thái Pending hoặc Packing.");

        var updated = await _repo.UpdateStatusAsync(id, "Cancelled");
        if (updated is null)
            throw new NotFoundException($"Không tìm thấy order với Id = {id}");

        return await EnrichOrderAsync(updated);
    }

    public async Task DeleteAsync(int id)
    {
        var result = await _repo.DeleteAsync(id);
        if (!result)
            throw new NotFoundException($"Không tìm thấy order với Id = {id}");
    }

    private async Task<OrderResponseDto> EnrichOrderAsync(Order order)
    {
        var userTask    = _userClient.GetUserByIdAsync(order.UserId);
        var productTask = _productClient.GetProductByIdAsync(order.ProductId);
        await Task.WhenAll(userTask, productTask);

        UserDto?    user    = null;
        ProductDto? product = null;

        try { user    = await userTask;    } catch { }
        try { product = await productTask; } catch { }

        return new OrderResponseDto
        {
            Id         = order.Id,
            UserId     = order.UserId,
            ProductId  = order.ProductId,
            Quantity   = order.Quantity,
            TotalPrice = order.TotalPrice,
            Status     = order.Status,
            ShipperId  = order.ShipperId,
            CreatedAt  = order.CreatedAt,
            User       = user,
            Product    = product,
        };
    }
}