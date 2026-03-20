namespace SellerService.DTOs;

public class RegisterQrRequest
{
    public string BankCode { get; set; } = string.Empty;    // VD: "MB", "VCB", "970415"
    public string AccountNo { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
}

public class QrInfoResponse
{
    public int SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public string? BankCode { get; set; }
    public string? AccountNo { get; set; }
    public string? AccountName { get; set; }
    public string QrStatus { get; set; } = string.Empty;
    public string? RejectedReason { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }

    // VietQR URL để FE render ảnh QR
    public string? VietQrUrl => QrStatus == "Approved" && BankCode != null && AccountNo != null
        ? $"https://api.vietqr.io/image/{BankCode}-{AccountNo}-compact2.jpg?accountName={Uri.EscapeDataString(AccountName ?? "")}"
        : null;
}

// Dùng cho Admin — xem danh sách chờ duyệt
public class PendingQrItem
{
    public int SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string BankCode { get; set; } = string.Empty;
    public string AccountNo { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
}

public class ReviewQrRequest
{
    public bool Approved { get; set; }
    public string? RejectedReason { get; set; }
}