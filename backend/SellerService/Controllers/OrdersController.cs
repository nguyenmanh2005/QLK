using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SellerService.DTOs;
using SellerService.Services.Interface;

namespace SellerService.Controllers;

[ApiController]
[Route("api/seller/orders")]
[Authorize(Roles = "Seller")]
public class OrdersController : ControllerBase
{
    private readonly ISellerOrderService _orderService;

    public OrdersController(ISellerOrderService orderService)
    {
        _orderService = orderService;
    }

    private string Token =>
        Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

    private int SellerId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var (ok, status, data) = await _orderService.GetSellerOrdersAsync(Token, SellerId);
        return ok ? Ok(data) : StatusCode(status, data);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        var (ok, status, body) = await _orderService.UpdateStatusAsync(Token, id, dto);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }
}