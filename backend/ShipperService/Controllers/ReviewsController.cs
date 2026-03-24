using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipperService.DTOs;
using ShipperService.Services.Interface;

namespace ShipperService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IShipperService _service;

    public ReviewsController(IShipperService service)
    {
        _service = service;
    }

    // POST api/reviews
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview(CreateShipperReviewDto dto)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            return Unauthorized();

        var review = await _service.CreateReviewAsync(userId, dto);
        return Ok(review);
    }

    // GET api/reviews/shipper/{shipperId}
    [HttpGet("shipper/{shipperId}")]
    public async Task<IActionResult> GetRating(int shipperId)
    {
        var rating = await _service.GetRatingAsync(shipperId);
        return Ok(rating);
    }
}
