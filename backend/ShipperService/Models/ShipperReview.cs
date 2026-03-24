namespace ShipperService.Models;

public class ShipperReview
{
    public int Id { get; set; }
    public int ShipperId { get; set; }
    public int UserId { get; set; }
    public int OrderId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Shipper? Shipper { get; set; }
}
