namespace ProductService.Middlewares; // đổi namespace theo từng service

// Lỗi không tìm thấy → 404
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

// Lỗi dữ liệu sai → 400
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message) { }
}

// Lỗi chưa đăng nhập → 401
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}

// Lỗi không có quyền → 403
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }
}