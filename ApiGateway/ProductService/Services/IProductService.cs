// ═══════════════════════════════════════════════════════════
// IProductService.cs
// ═══════════════════════════════════════════════════════════
using ProductService.DTOs;
using ProductService.Models;
using ProductService.Repositories;

namespace ProductService.Services;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllAsync();
    Task<ProductResponseDto> GetByIdAsync(int id);
    Task<ProductResponseDto> CreateAsync(CreateProductDto dto);
    Task<ProductResponseDto> UpdateAsync(int id, UpdateProductDto dto);
    Task DeleteAsync(int id);
}