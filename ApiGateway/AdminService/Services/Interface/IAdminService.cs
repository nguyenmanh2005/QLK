using AdminService.DTOs;

namespace AdminService.Services.Interface;

public interface IAdminService
{
    Task<AdminResponseDto> RegisterAsync(RegisterAdminDto dto);
    Task<string>           LoginAsync(LoginAdminDto dto);
}