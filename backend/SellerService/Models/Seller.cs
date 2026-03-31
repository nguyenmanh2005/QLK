namespace SellerService.Models;

public class Seller
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ─── QR Payment ───────────────────────────────────────
    public string? BankCode { get; set; }         // Mã ngân hàng VietQR: MB, VCB, TCB...
    public string? AccountNo { get; set; }        // Số tài khoản
    public string? AccountName { get; set; }      // Tên chủ tài khoản
    public QrStatus QrStatus { get; set; } = QrStatus.None;
    public string? QrRejectedReason { get; set; } // Lý do từ chối (nếu có)
    public DateTime? QrSubmittedAt { get; set; }  // Thời gian nộp đơn
    public DateTime? QrApprovedAt { get; set; }   // Thời gian được duyệt
}

public enum QrStatus
{
    None,       // Chưa đăng ký
    Pending,    // Đang chờ duyệt
    Approved,   // Đã được duyệt
    Rejected    // Bị từ chối
}