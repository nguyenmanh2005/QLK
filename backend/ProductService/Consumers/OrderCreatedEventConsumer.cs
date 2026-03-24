using MassTransit;
using Shared.Messages.Events;
using ProductService.Data;
using Microsoft.Extensions.Logging;

namespace ProductService.Consumers;

public class OrderCreatedEventConsumer : IConsumer<OrderCreatedEvent>
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<OrderCreatedEventConsumer> _logger;

    public OrderCreatedEventConsumer(AppDbContext dbContext, ILogger<OrderCreatedEventConsumer> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        var productId = context.Message.ProductId;
        var quantity = context.Message.Quantity;

        _logger.LogInformation($"Received OrderCreatedEvent cho ProductId={productId}, Quantity={quantity}");

        var product = await _dbContext.Products.FindAsync(new object[] { productId }, context.CancellationToken);
        if (product != null)
        {
            if (product.Stock >= quantity)
            {
                product.Stock -= quantity;
                await _dbContext.SaveChangesAsync(context.CancellationToken);
                _logger.LogInformation($"Giảm kho thành công. Tồn kho mới: {product.Stock}");
            }
            else
            {
                _logger.LogWarning($"Cảnh báo: Sản phẩm Id={productId} không đủ kho để trừ! Tồn kho: {product.Stock}, Cần trừ: {quantity}");
            }
        }
        else
        {
            _logger.LogError($"Lỗi: Không tìm thấy sản phẩm Id={productId} trong DB!");
        }
    }
}
