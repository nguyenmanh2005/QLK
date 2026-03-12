using ProductService.DTOs;
using ProductService.Models;
using ProductService.Repositories;

namespace ProductService.Services;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllAsync();
    Task<ProductResponseDto?> GetByIdAsync(int id);
    Task<ProductResponseDto> CreateAsync(CreateProductDto dto);
    Task<ProductResponseDto?> UpdateAsync(int id, UpdateProductDto dto);
    Task<bool> DeleteAsync(int id);
}

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;

    public ProductService(IProductRepository repo) => _repo = repo;

    public async Task<IEnumerable<ProductResponseDto>> GetAllAsync()
    {
        var products = await _repo.GetAllAsync();
        return products.Select(MapToResponse);
    }

    public async Task<ProductResponseDto?> GetByIdAsync(int id)
    {
        var product = await _repo.GetByIdAsync(id);
        return product is null ? null : MapToResponse(product);
    }

    public async Task<ProductResponseDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock
        };
        var created = await _repo.CreateAsync(product);
        return MapToResponse(created);
    }

    public async Task<ProductResponseDto?> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock
        };
        var updated = await _repo.UpdateAsync(id, product);
        return updated is null ? null : MapToResponse(updated);
    }

    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);

    private static ProductResponseDto MapToResponse(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        Stock = p.Stock,
        CreatedAt = p.CreatedAt
    };
}
