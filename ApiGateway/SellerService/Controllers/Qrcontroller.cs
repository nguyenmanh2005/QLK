using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellerService.Data;
using SellerService.DTOs;
using SellerService.Models;
using System.Security.Claims;

namespace SellerService.Controllers;

[ApiController]
[Route("api/seller/qr")]
public class QrController : ControllerBase
{
    private readonly SellerDbContext _db;

    public QrController(SellerDbContext db) => _db = db;

    private int SellerId => int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    // POST /api/seller/qr/register
    [HttpPost("register")]
    [Authorize]
    public async Task<IActionResult> Register([FromBody] RegisterQrRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.BankCode) ||
            string.IsNullOrWhiteSpace(req.AccountNo) ||
            string.IsNullOrWhiteSpace(req.AccountName))
            return BadRequest("Vui lòng điền đầy đủ thông tin ngân hàng");

        var seller = await _db.Sellers.FindAsync(SellerId);
        if (seller == null) return NotFound();

        if (seller.QrStatus == QrStatus.Pending)
            return BadRequest("Đơn đăng ký QR của bạn đang chờ duyệt");

        seller.BankCode         = req.BankCode.Trim().ToUpper();
        seller.AccountNo        = req.AccountNo.Trim();
        seller.AccountName      = req.AccountName.Trim().ToUpper();
        seller.QrStatus         = QrStatus.Pending;
        seller.QrRejectedReason = null;
        seller.QrSubmittedAt    = DateTime.UtcNow;
        seller.QrApprovedAt     = null;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Đăng ký thành công! Đang chờ admin phê duyệt." });
    }

    // GET /api/seller/qr/status
    [HttpGet("status")]
    [Authorize]
    public async Task<ActionResult<QrInfoResponse>> GetStatus()
    {
        var seller = await _db.Sellers.FindAsync(SellerId);
        if (seller == null) return NotFound();
        return Ok(MapToQrInfo(seller));
    }

    // GET /api/seller/{id}/qr — Public, FE checkout gọi
    [HttpGet("/api/seller/{id}/qr")]
    [AllowAnonymous]
    public async Task<ActionResult<QrInfoResponse>> GetSellerQr(int id)
    {
        var seller = await _db.Sellers.FindAsync(id);
        if (seller == null) return NotFound();

        if (seller.QrStatus != QrStatus.Approved)
            return Ok(new QrInfoResponse
            {
                SellerId   = seller.Id,
                SellerName = seller.Name,
                QrStatus   = seller.QrStatus.ToString()
            });

        return Ok(MapToQrInfo(seller));
    }

    // GET /api/seller/qr/pending — Admin
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<PendingQrItem>>> GetPending()
    {
        var list = await _db.Sellers
            .Where(s => s.QrStatus == QrStatus.Pending)
            .OrderBy(s => s.QrSubmittedAt)
            .Select(s => new PendingQrItem
            {
                SellerId    = s.Id,
                SellerName  = s.Name,
                Email       = s.Email,
                BankCode    = s.BankCode!,
                AccountNo   = s.AccountNo!,
                AccountName = s.AccountName!,
                SubmittedAt = s.QrSubmittedAt!.Value
            }).ToListAsync();

        return Ok(list);
    }

    // PUT /api/seller/qr/{sellerId}/review — Admin duyệt/từ chối
    [HttpPut("{sellerId}/review")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Review(int sellerId, [FromBody] ReviewQrRequest req)
    {
        var seller = await _db.Sellers.FindAsync(sellerId);
        if (seller == null) return NotFound();
        if (seller.QrStatus != QrStatus.Pending)
            return BadRequest("Đơn này không ở trạng thái chờ duyệt");

        if (req.Approved)
        {
            seller.QrStatus     = QrStatus.Approved;
            seller.QrApprovedAt = DateTime.UtcNow;
        }
        else
        {
            if (string.IsNullOrWhiteSpace(req.RejectedReason))
                return BadRequest("Vui lòng nhập lý do từ chối");
            seller.QrStatus         = QrStatus.Rejected;
            seller.QrRejectedReason = req.RejectedReason;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = req.Approved ? "Đã phê duyệt" : "Đã từ chối" });
    }

    // PUT /api/seller/{sellerId}/qr/admin-update — Admin cập nhật thông tin QR và approve luôn
    [HttpPut("/api/seller/{sellerId}/qr/admin-update")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminUpdate(int sellerId, [FromBody] AdminUpdateQrRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.BankCode) ||
            string.IsNullOrWhiteSpace(req.AccountNo) ||
            string.IsNullOrWhiteSpace(req.AccountName))
            return BadRequest("Vui lòng điền đầy đủ thông tin ngân hàng");

        var seller = await _db.Sellers.FindAsync(sellerId);
        if (seller == null) return NotFound();

        seller.BankCode         = req.BankCode.Trim().ToUpper();
        seller.AccountNo        = req.AccountNo.Trim();
        seller.AccountName      = req.AccountName.Trim().ToUpper();
        seller.QrStatus         = QrStatus.Approved;
        seller.QrRejectedReason = null;
        seller.QrSubmittedAt    = seller.QrSubmittedAt ?? DateTime.UtcNow;
        seller.QrApprovedAt     = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật và phê duyệt QR thành công!" });
    }

    private static QrInfoResponse MapToQrInfo(Seller s) => new()
    {
        SellerId       = s.Id,
        SellerName     = s.Name,
        BankCode       = s.BankCode,
        AccountNo      = s.AccountNo,
        AccountName    = s.AccountName,
        QrStatus       = s.QrStatus.ToString(),
        RejectedReason = s.QrRejectedReason,
        SubmittedAt    = s.QrSubmittedAt,
        ApprovedAt     = s.QrApprovedAt
    };
}