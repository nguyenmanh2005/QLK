using System.ComponentModel.DataAnnotations;

namespace UserService.DTOs;

public class UpdateProfileDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}
