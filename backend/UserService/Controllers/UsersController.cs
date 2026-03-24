using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.DTOs;
using UserService.Services;

namespace UserService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service) => _service = service;

    // POST api/users/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _service.LoginAsync(dto);
        return Ok(result);
    }

    // GET api/users
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    // GET api/users/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _service.GetByIdAsync(id);
        return Ok(user);
    }

    // GET api/users/batch?ids=1,2,3  ← MỚI: dùng cho OrderService
    [HttpGet("batch")]
    public async Task<IActionResult> GetBatch([FromQuery] string ids)
    {
        if (string.IsNullOrWhiteSpace(ids))
            return Ok(Enumerable.Empty<UserResponseDto>());

        var idList = ids.Split(',')
                        .Select(s => int.TryParse(s.Trim(), out var n) ? n : 0)
                        .Where(n => n > 0)
                        .Distinct()
                        .ToList();

        var users = await _service.GetByIdsAsync(idList);
        return Ok(users);
    }

    // POST api/users
    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT api/users/profile
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            return Unauthorized();

        var updated = await _service.UpdateProfileAsync(userId, dto);
        return Ok(updated);
    }

    // PUT api/users/5
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId) || currentUserId != id)
            return Unauthorized("Bạn chỉ có quyền sửa thông tin của chính mình.");

        var updated = await _service.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpPut("admin/update/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminUpdate(int id, UpdateUserDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return Ok(updated);
    }

    // DELETE api/users/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}