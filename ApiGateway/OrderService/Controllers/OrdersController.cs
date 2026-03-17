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

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
        => Ok(await _service.GetByUserIdAsync(userId));

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
        => Ok(await _service.UpdateStatusAsync(id, dto));

    /// <summary>
    /// Hủy đơn hàng — chỉ cho phép khi status là Pending hoặc Packing.
    /// PATCH api/orders/{id}/cancel
    /// </summary>
    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
        => Ok(await _service.CancelAsync(id));

    [HttpPatch("{id}/assign-shipper")]
    public async Task<IActionResult> AssignShipper(int id, AssignShipperDto dto)
    {
        var updated = await _service.AssignShipperAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}