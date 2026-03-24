using AdminService.DTOs;

namespace AdminService.Services.Interfaces;

public interface IShipperAdminService
{
    Task<(bool Success, int StatusCode, string Body)> GetAllAsync(string token);
    Task<(bool Success, int StatusCode, string Body)> CreateAsync(string token, CreatePersonDto dto);
    Task<(bool Success, int StatusCode, string Body)> UpdateAsync(string token, int id, UpdatePersonDto dto);
    Task<(bool Success, int StatusCode, string Body)> DeleteAsync(string token, int id);
}