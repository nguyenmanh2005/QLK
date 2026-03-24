using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.DTOs;
using ProductService.Models;

namespace ProductService.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public CategoryController(AppDbContext db, IWebHostEnvironment env)
    {
        _db  = db;
        _env = env;
    }

    // GET /api/categories
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<CategoryResponseDto>>> GetAll()
    {
        var list = await _db.Categories
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => ToDto(c))
            .ToListAsync();

        return Ok(list);
    }

    // GET /api/categories/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<CategoryResponseDto>> GetById(int id)
    {
        var cat = await _db.Categories.FindAsync(id);
        if (cat is null) return NotFound();
        return Ok(ToDto(cat));
    }

    // POST /api/categories
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoryResponseDto>> Create([FromBody] CreateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Tên danh mục không được để trống");

        var cat = new Category
        {
            Name        = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            ImageUrl    = dto.ImageUrl?.Trim(),
            SortOrder   = dto.SortOrder,
            CreatedAt   = DateTime.UtcNow,
        };

        _db.Categories.Add(cat);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cat.Id }, ToDto(cat));
    }

    // PUT /api/categories/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoryResponseDto>> Update(int id, [FromBody] UpdateCategoryDto dto)
    {
        var cat = await _db.Categories.FindAsync(id);
        if (cat is null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Tên danh mục không được để trống");

        cat.Name        = dto.Name.Trim();
        cat.Description = dto.Description?.Trim();
        cat.ImageUrl    = dto.ImageUrl?.Trim();
        cat.SortOrder   = dto.SortOrder;

        await _db.SaveChangesAsync();
        return Ok(ToDto(cat));
    }

    // DELETE /api/categories/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var cat = await _db.Categories.FindAsync(id);
        if (cat is null) return NotFound();

        // Xóa ảnh local nếu có
        if (!string.IsNullOrEmpty(cat.ImageUrl) && cat.ImageUrl.StartsWith("/uploads/"))
        {
            var filePath = Path.Combine(_env.WebRootPath, cat.ImageUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);
        }

        _db.Categories.Remove(cat);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/categories/upload-image — upload ảnh, trả về URL
    [HttpPost("upload-image")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("Vui lòng chọn file ảnh");

        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            return BadRequest("Chỉ hỗ trợ jpg, jpeg, png, webp");

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("File không được vượt quá 5MB");

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "categories");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var url = $"/uploads/categories/{fileName}";
        return Ok(new { url });
    }

    private static CategoryResponseDto ToDto(Category c) => new()
    {
        Id          = c.Id,
        Name        = c.Name,
        Description = c.Description,
        ImageUrl    = c.ImageUrl,
        SortOrder   = c.SortOrder,
        CreatedAt   = c.CreatedAt,
    };
}