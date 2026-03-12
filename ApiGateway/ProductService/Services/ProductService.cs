using ProductService.DTOs;
using ProductService.Middlewares;
using ProductService.Models;
using ProductService.Repositories;

namespace ProductService.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;

    public ProductService(IProductRepository repo) => _repo = repo;

    public async Task<IEnumerable<ProductResponseDto>> GetAllAsync()
    {
        var products = await _repo.GetAllAsync();
        return products.Select(MapToResponse);
    }

    public async Task<ProductResponseDto> GetByIdAsync(int id)
    {
        var product = await _repo.GetByIdAsync(id);
        if (product is null)
            throw new NotFoundException($"Không tìm thấy product với Id = {id}");
        return MapToResponse(product);
    }

    public async Task<ProductResponseDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            ImageUrl = dto.ImageUrl
        };
        var created = await _repo.CreateAsync(product);
        return MapToResponse(created);
    }

    public async Task<ProductResponseDto> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            ImageUrl = dto.ImageUrl
        };
        var updated = await _repo.UpdateAsync(id, product);
        if (updated is null)
            throw new NotFoundException($"Không tìm thấy product với Id = {id}");
        return MapToResponse(updated);
    }

    public async Task DeleteAsync(int id)
    {
        var result = await _repo.DeleteAsync(id);
        if (!result)
            throw new NotFoundException($"Không tìm thấy product với Id = {id}");
    }

    private static ProductResponseDto MapToResponse(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        Stock = p.Stock,
        ImageUrl = p.ImageUrl,
        CreatedAt = p.CreatedAt
    };
}