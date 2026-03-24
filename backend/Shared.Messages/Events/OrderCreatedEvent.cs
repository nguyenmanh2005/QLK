namespace Shared.Messages.Events;

public record OrderCreatedEvent(int ProductId, int Quantity)
{
    // Cần có constructor rỗng để MassTransit có thể deserialize cục data JSON
    public OrderCreatedEvent() : this(0, 0) {}
}
