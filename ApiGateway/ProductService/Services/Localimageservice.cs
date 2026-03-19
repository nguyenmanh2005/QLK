using ProductService.Services.Interfaces;

namespace ProductService.Services;

public class LocalImageService : IImageService
{
    private static readonly string[] _allowed = ["image/jpeg", "image/png", "image/webp"];

    public async Task<string> UploadAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File không hợp lệ");

        if (!_allowed.Contains(file.ContentType))
            throw new ArgumentException("Chỉ chấp nhận JPG, PNG, WebP");

        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsPath);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsPath, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/{fileName}";
    }
}