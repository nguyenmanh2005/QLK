namespace ProductService.DTOs;

public class CreateCategoryDto
{
    public string  Name        { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl    { get; set; }
    public int     SortOrder   { get; set; } = 0;
}

public class UpdateCategoryDto
{
    public string  Name        { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl    { get; set; }
    public int     SortOrder   { get; set; } = 0;
}

public class CategoryResponseDto
{
    public int      Id          { get; set; }
    public string   Name        { get; set; } = string.Empty;
    public string?  Description { get; set; }
    public string?  ImageUrl    { get; set; }
    public int      SortOrder   { get; set; }
    public DateTime CreatedAt   { get; set; }
}