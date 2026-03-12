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
        return result is null ? Unauthorized("Email hoặc mật khẩu không đúng!") : Ok(result);
    }

    // GET api/users
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    // GET api/users/5
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _service.GetByIdAsync(id);
        return user is null ? NotFound($"Không tìm thấy user với Id = {id}") : Ok(user);
    }

    // POST api/users
    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        try
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT api/users/5
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return updated is null ? NotFound($"Không tìm thấy user với Id = {id}") : Ok(updated);
    }

    // DELETE api/users/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id)
            ? NoContent()
            : NotFound($"Không tìm thấy user với Id = {id}");
}
