namespace OrderService.DTOs;

public class CreateOrderDto
{
    public int UserId    { get; set; }
    public int ProductId { get; set; }
    public int Quantity  { get; set; }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class AssignShipperDto
{
    public int ShipperId { get; set; }
}

public class UserDto
{
    public int    Id    { get; set; }
    public string Name  { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class ProductDto
{
    public int     Id    { get; set; }
    public string  Name  { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int     Stock { get; set; }
}

public class OrderResponseDto
{
    public int       Id         { get; set; }
    public int       UserId     { get; set; }
    public int       ProductId  { get; set; }
    public int       Quantity   { get; set; }
    public decimal   TotalPrice { get; set; }
    public string    Status     { get; set; } = string.Empty;
    public int?      ShipperId  { get; set; }
    public DateTime  CreatedAt  { get; set; }
    public UserDto?  User       { get; set; }
    public ProductDto? Product  { get; set; }
}