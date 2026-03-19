using SellerService.DTOs;

namespace SellerService.Services.Interface;

public interface ISellerProductService
{
    Task<(bool Success, int StatusCode, string Body)> GetAllAsync(string token, int sellerId);
    Task<(bool Success, int StatusCode, string Body)> CreateAsync(string token, CreateProductDto dto);
    Task<(bool Success, int StatusCode, string Body)> UpdateAsync(string token, int id, UpdateProductDto dto);
    Task<(bool Success, int StatusCode, string Body)> DeleteAsync(string token, int id, int sellerId);
}