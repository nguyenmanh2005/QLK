using AdminService.DTOs;

namespace AdminService.Services;

public interface IAdminService
{
    Task<AdminResponseDto> RegisterAsync(RegisterAdminDto dto);
    Task<string>           LoginAsync(LoginAdminDto dto);
}