using ProductService.Middlewares;
using System.Net;
using System.Text.Json;

namespace ProductService.Middlewares; // đổi theo từng service

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context); // chạy bình thường
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        // Xác định HTTP status code theo loại lỗi
        var statusCode = ex switch
        {
            NotFoundException => HttpStatusCode.NotFound,           // 404
            BadRequestException => HttpStatusCode.BadRequest,         // 400
            UnauthorizedException => HttpStatusCode.Unauthorized,      // 401
            ForbiddenException => HttpStatusCode.Forbidden,          // 403
            _ => HttpStatusCode.InternalServerError  // 500
        };

        // Tạo response JSON chuẩn
        var response = new
        {
            status = (int)statusCode,
            error = GetErrorTitle(statusCode),
            message = ex.Message,
            timestamp = DateTime.UtcNow
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
    }

    private static string GetErrorTitle(HttpStatusCode code) => code switch
    {
        HttpStatusCode.NotFound => "Không tìm thấy dữ liệu",
        HttpStatusCode.BadRequest => "Dữ liệu không hợp lệ",
        HttpStatusCode.Unauthorized => "Chưa xác thực",
        HttpStatusCode.Forbidden => "Không có quyền truy cập",
        HttpStatusCode.InternalServerError => "Lỗi hệ thống",
        _ => "Lỗi không xác định"
    };
}