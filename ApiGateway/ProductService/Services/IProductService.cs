using ProductService.DTOs;

namespace ProductService.Services;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllAsync();
    Task<ProductResponseDto> GetByIdAsync(int id);
    Task<IEnumerable<ProductResponseDto>> GetByIdsAsync(IEnumerable<int> ids); // ← MỚI
    Task<ProductResponseDto> CreateAsync(CreateProductDto dto);
    Task<ProductResponseDto> UpdateAsync(int id, UpdateProductDto dto);
    Task DeleteAsync(int id);
}