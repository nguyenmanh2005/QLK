using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.DTOs;
using OrderService.Services;

namespace OrderService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;

    public OrdersController(IOrderService service) => _service = service;

    // GET api/orders
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    // GET api/orders/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _service.GetByIdAsync(id);
        return order is null ? NotFound($"Không tìm thấy order với Id = {id}") : Ok(order);
    }

    // GET api/orders/user/3
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
        => Ok(await _service.GetByUserIdAsync(userId));

    // POST api/orders
    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto dto)
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

    // PATCH api/orders/5/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        try
        {
            var updated = await _service.UpdateStatusAsync(id, dto);
            return updated is null ? NotFound($"Không tìm thấy order với Id = {id}") : Ok(updated);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // DELETE api/orders/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id)
            ? NoContent()
            : NotFound($"Không tìm thấy order với Id = {id}");
}
