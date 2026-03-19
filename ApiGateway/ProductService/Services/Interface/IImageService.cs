namespace ProductService.Services.Interfaces;

public interface IImageService
{
    Task<string> UploadAsync(IFormFile file);
}