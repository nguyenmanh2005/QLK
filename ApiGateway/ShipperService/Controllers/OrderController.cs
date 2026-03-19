using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ShipperService.DTOs;
using ShipperService.Services.Interface;

namespace ShipperService.Controllers;

[ApiController]
[Route("api/shipper/orders")]
[Authorize(Roles = "Shipper")]
public class OrdersController : ControllerBase
{
    private readonly IShipperOrderService _orderService;

    public OrdersController(IShipperOrderService orderService)
    {
        _orderService = orderService;
    }

    private string Token =>
        Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

    private int ShipperId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable()
    {
        var (ok, status, data) = await _orderService.GetAvailableAsync(Token);
        return ok ? Ok(data) : StatusCode(status, data);
    }

    [HttpGet("my-delivering")]
    public async Task<IActionResult> GetMyDelivering()
    {
        var (ok, status, data) = await _orderService.GetMyDeliveringAsync(Token, ShipperId);
        return ok ? Ok(data) : StatusCode(status, data);
    }

    [HttpGet("my-delivered")]
    public async Task<IActionResult> GetMyDelivered()
    {
        var (ok, status, data) = await _orderService.GetMyDeliveredAsync(Token, ShipperId);
        return ok ? Ok(data) : StatusCode(status, data);
    }

    [HttpPatch("{id}/assign")]
    public async Task<IActionResult> Assign(int id)
    {
        var (ok, status, body) = await _orderService.AssignAsync(Token, id, ShipperId);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpPut("{id}/delivered")]
    public async Task<IActionResult> ConfirmDelivered(int id)
    {
        var (ok, status, body) = await _orderService.ConfirmDeliveredAsync(Token, id, ShipperId);
        if (!ok && status == 403) return Forbid();
        if (!ok && status == 404) return NotFound();
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpPut("{id}/return")]
    public async Task<IActionResult> ReturnOrder(int id)
    {
        var (ok, status, body) = await _orderService.ReturnOrderAsync(Token, id, ShipperId);
        if (!ok && status == 403) return Forbid();
        if (!ok && status == 404) return NotFound();
        if (!ok && status == 400) return BadRequest(body);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }
}