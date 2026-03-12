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
        return Ok(result); // nếu sai → LoginAsync throw UnauthorizedException → Middleware bắt
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
        return Ok(user); // nếu null → GetByIdAsync throw NotFoundException → Middleware bắt
    }

    // POST api/users
    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT api/users/5
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
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