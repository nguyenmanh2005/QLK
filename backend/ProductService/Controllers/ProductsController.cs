using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductService.DTOs;
using ProductService.Services.Interface;
using ProductService.Services.Interfaces;

namespace ProductService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;
    private readonly IImageService _imageService;

    public ProductsController(IProductService service, IImageService imageService)
    {
        _service = service;
        _imageService = imageService;
    }

    // GET api/products
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    // GET api/products/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
        => Ok(await _service.GetByIdAsync(id));

    // GET api/products/seller/5
    [HttpGet("seller/{sellerId}")]
    public async Task<IActionResult> GetBySeller(int sellerId)
    {
        var products = await _service.GetAllAsync();
        var filtered = products.Where(p => p.SellerId == sellerId);
        return Ok(filtered);
    }

    // GET api/products/batch?ids=1,2,3
    [HttpGet("batch")]
    public async Task<IActionResult> GetBatch([FromQuery] string ids)
    {
        if (string.IsNullOrWhiteSpace(ids))
            return Ok(Enumerable.Empty<ProductResponseDto>());

        var idList = ids.Split(',')
                        .Select(s => int.TryParse(s.Trim(), out var n) ? n : 0)
                        .Where(n => n > 0)
                        .Distinct()
                        .ToList();

        return Ok(await _service.GetByIdsAsync(idList));
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
        => Ok(await _service.UpdateAsync(id, dto));

    // DELETE api/products/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    // POST api/products/upload-image
    [HttpPost("upload-image")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            var imageUrl = await _imageService.UploadAsync(file);
            return Ok(new { imageUrl });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}