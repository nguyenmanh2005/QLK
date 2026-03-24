namespace SellerService.DTOs;

public class AdminUpdateQrRequest
{
    public string BankCode    { get; set; } = string.Empty;
    public string AccountNo   { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
}