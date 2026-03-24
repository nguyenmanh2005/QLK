using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SellerService.DTOs;
using SellerService.Services.Interface;

namespace SellerService.Controllers;

[ApiController]
[Route("api/seller/products")]
[Authorize(Roles = "Seller")]
public class ProductsController : ControllerBase
{
    private readonly ISellerProductService _productService;

    public ProductsController(ISellerProductService productService)
    {
        _productService = productService;
    }

    private string Token =>
        Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

    private int SellerId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var (_, _, body) = await _productService.GetAllAsync(Token, SellerId);
        return Content(body, "application/json");
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        dto.SellerId = SellerId;
        var (ok, status, body) = await _productService.CreateAsync(Token, dto);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        dto.SellerId = SellerId;
        var (ok, status, body) = await _productService.UpdateAsync(Token, id, dto);
        return ok ? Content(body, "application/json") : StatusCode(status, body);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (ok, status, body) = await _productService.DeleteAsync(Token, id, SellerId);
        if (!ok && status == 404) return NotFound();
        if (!ok && status == 403) return Forbid();
        return ok ? NoContent() : BadRequest(body);
    }
}