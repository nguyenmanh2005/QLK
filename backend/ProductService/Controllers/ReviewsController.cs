using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductService.DTOs;
using ProductService.Services.Interface;

namespace ProductService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _service;
    public ReviewsController(IReviewService service) => _service = service;

    // GET api/reviews/product/5  — lấy tất cả review của 1 sản phẩm
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(int productId)
        => Ok(await _service.GetByProductIdAsync(productId));

    // GET api/reviews/check/{orderId}  — kiểm tra đơn đã review chưa
    [HttpGet("check/{orderId}")]
    [Authorize]
    public async Task<IActionResult> Check(int orderId)
        => Ok(new { reviewed = await _service.HasReviewedAsync(orderId) });

    // POST api/reviews  — tạo review mới
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(CreateReviewDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetByProduct), new { productId = created.ProductId }, created);
    }

    // POST api/reviews/upload-image  — upload ảnh minh chứng
    [HttpPost("upload-image")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "File không hợp lệ" });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(file.ContentType))
            return BadRequest(new { message = "Chỉ chấp nhận JPG, PNG, WebP" });

        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsPath);

        var ext      = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"review_{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsPath, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return Ok(new { imageUrl = $"/uploads/{fileName}" });
    }
}