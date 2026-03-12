using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductService.DTOs;
using ProductService.Services;

namespace ProductService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service) => _service = service;

    // GET api/products
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    // GET api/products/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _service.GetByIdAsync(id);
        return Ok(product);
    }

    // POST api/products
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT api/products/5
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return Ok(updated);
    }

    // DELETE api/products/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}