using Microsoft.AspNetCore.Mvc;
using AdminService.DTOs;
using AdminService.Services.Interface;

namespace AdminService.Controllers;

[ApiController]
[Route("api/admin")]
public class AuthController : ControllerBase
{
    private readonly IAdminService _service;
    public AuthController(IAdminService service) => _service = service;

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterAdminDto dto)
        => Ok(await _service.RegisterAsync(dto));

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginAdminDto dto)
        => Ok(new { token = await _service.LoginAsync(dto) });
}