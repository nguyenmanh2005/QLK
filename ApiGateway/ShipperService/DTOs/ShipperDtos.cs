namespace ShipperService.DTOs;

public class RegisterShipperDto
{
    public string Name     { get; set; } = string.Empty;
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginShipperDto
{
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ShipperResponseDto
{
    public int      Id        { get; set; }
    public string   Name      { get; set; } = string.Empty;
    public string   Email     { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class OrderDto
{
    public int      Id          { get; set; }
    public int      UserId      { get; set; }
    public int      ProductId   { get; set; }
    public string?  ProductName { get; set; }
    public int      Quantity    { get; set; }
    public decimal  TotalPrice  { get; set; }
    public string   Status      { get; set; } = string.Empty;
    public int?     ShipperId   { get; set; }
    public DateTime CreatedAt   { get; set; }
}
public class UpdateShipperDto
{
    public string  Name     { get; set; } = string.Empty;
    public string  Email    { get; set; } = string.Empty;
    public string? Password { get; set; }
}