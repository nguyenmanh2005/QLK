namespace AdminService.DTOs;

public class RegisterAdminDto
{
    public string Name     { get; set; } = string.Empty;
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginAdminDto
{
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AdminResponseDto
{
    public int      Id        { get; set; }
    public string   Name      { get; set; } = string.Empty;
    public string   Email     { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// Dùng cho tạo mới user/seller/shipper
public class CreatePersonDto
{
    public string Name     { get; set; } = string.Empty;
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// Dùng cho cập nhật user/seller/shipper
public class UpdatePersonDto
{
    public string  Name     { get; set; } = string.Empty;
    public string  Email    { get; set; } = string.Empty;
    public string? Password { get; set; }
}

public class UserDto
{
    public int      Id        { get; set; }
    public string   Name      { get; set; } = string.Empty;
    public string   Email     { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}