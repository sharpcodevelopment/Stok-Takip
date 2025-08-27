using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StokTakip.API.Data;
using StokTakip.API.Models;
using StokTakip.API.DTOs;
using System.Security.Claims;

namespace StokTakip.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StockRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StockRequestsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetStockRequests()
        {
            var requests = await _context.StockRequests
                .Include(r => r.Product)
                .Include(r => r.RequestedBy)
                .Include(r => r.ApprovedBy)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.ProductId,
                    ProductName = r.Product.Name,
                    ProductBrand = r.Product.Brand,
                    r.RequestedById,
                    RequestedByName = $"{r.RequestedBy.FirstName} {r.RequestedBy.LastName}",
                    r.Quantity,
                    r.Priority,
                    r.Notes,
                    r.Status,
                    r.CreatedAt,
                    r.UpdatedAt,
                    r.ApprovedById,
                    ApprovedByName = r.ApprovedBy != null ? $"{r.ApprovedBy.FirstName} {r.ApprovedBy.LastName}" : null,
                    r.ApprovedAt,
                    r.RejectionReason
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost]
        public async Task<ActionResult<StockRequest>> CreateStockRequest([FromBody] CreateStockRequestDTO requestDto)
        {
            try
            {
                // Kullanıcıyı bul
                var user = await _context.Users.FindAsync(requestDto.RequestedById);
                if (user == null)
                    return BadRequest(new { message = "Kullanıcı bulunamadı" });

                // Ürünü bul
                var product = await _context.Products.FindAsync(requestDto.ProductId);
                if (product == null)
                    return BadRequest(new { message = "Ürün bulunamadı" });

                var stockRequest = new StockRequest
                {
                    ProductId = requestDto.ProductId,
                    RequestedById = requestDto.RequestedById,
                    Quantity = requestDto.Quantity,
                    Priority = requestDto.Priority ?? "normal",
                    Notes = requestDto.Notes,
                    Status = "pending",
                    CreatedAt = DateTime.Now
                };

                _context.StockRequests.Add(stockRequest);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetStockRequests), new { id = stockRequest.Id }, stockRequest);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Talep oluşturulurken hata oluştu", error = ex.Message });
            }
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveStockRequest(int id)
        {
            var request = await _context.StockRequests
                .Include(r => r.Product)
                .FirstOrDefaultAsync(r => r.Id == id);
            
            if (request == null)
                return NotFound(new { message = "Talep bulunamadı" });

            if (request.Status != "pending")
                return BadRequest(new { message = "Bu talep zaten işlenmiş" });

            // JWT token'dan kullanıcı ID'sini al
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized();

            // Stok kontrolü
            if (request.Product.StockQuantity < request.Quantity)
                return BadRequest(new { message = $"Yetersiz stok. Mevcut: {request.Product.StockQuantity}, Talep: {request.Quantity}" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Stok talebini onayla
                request.Status = "approved";
                request.ApprovedById = user.Id;
                request.ApprovedAt = DateTime.Now;
                request.UpdatedAt = DateTime.Now;

                // Stok miktarını azalt
                request.Product.StockQuantity -= request.Quantity;

                // Stok hareketi kaydet
                var stockTransaction = new StockTransaction
                {
                    ProductId = request.ProductId,
                    TransactionType = TransactionType.Out, // Stok çıkışı
                    Quantity = request.Quantity,
                    UserId = user.Id,
                    TransactionDate = DateTime.Now,
                    Notes = "Stok talebi onaylandı"
                };

                _context.StockTransactions.Add(stockTransaction);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Talep onaylandı ve stok güncellendi" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "İşlem sırasında hata oluştu", error = ex.Message });
            }
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectStockRequest(int id, [FromBody] RejectRequestDTO rejectRequest)
        {
            Console.WriteLine($"=== REJECT REQUEST DEBUG ===");
            Console.WriteLine($"Request ID: {id}");
            Console.WriteLine($"Received reason: '{rejectRequest?.Reason}'");
            Console.WriteLine($"Reason is null or empty: {string.IsNullOrWhiteSpace(rejectRequest?.Reason)}");

            var request = await _context.StockRequests.FindAsync(id);
            if (request == null)
            {
                Console.WriteLine("Request not found");
                return NotFound(new { message = "Talep bulunamadı" });
            }

            Console.WriteLine($"Current request status: {request.Status}");

            if (request.Status != "pending")
                return BadRequest(new { message = "Bu talep zaten işlenmiş" });

            // Reddetme sebebi kontrolü
            if (string.IsNullOrWhiteSpace(rejectRequest.Reason))
            {
                Console.WriteLine("Rejection reason is empty - returning error");
                return BadRequest(new { message = "Reddetme sebebi boş olamaz" });
            }

            // JWT token'dan kullanıcı ID'sini al
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"User ID from token: {userId}");
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized();

            Console.WriteLine($"Setting RejectionReason to: '{rejectRequest.Reason.Trim()}'");

            request.Status = "rejected";
            request.RejectionReason = rejectRequest.Reason.Trim();
            request.ApprovedById = user.Id;
                            request.ApprovedAt = DateTime.Now;
                request.UpdatedAt = DateTime.Now;

            Console.WriteLine($"Before SaveChanges - RejectionReason: '{request.RejectionReason}'");
            
            var saveResult = await _context.SaveChangesAsync();
            Console.WriteLine($"SaveChanges result: {saveResult} rows affected");

            // Kontrol için tekrar oku
            var updatedRequest = await _context.StockRequests.FindAsync(id);
            Console.WriteLine($"After save - RejectionReason in DB: '{updatedRequest?.RejectionReason}'");
            Console.WriteLine($"=== END REJECT DEBUG ===");

            return Ok(new { message = "Talep reddedildi" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStockRequest(int id, [FromBody] UpdateStockRequestDTO updateDto)
        {
            var request = await _context.StockRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound();
            }

            // Sadece bekleyen talepler güncellenebilir
            if (request.Status != "pending")
            {
                return BadRequest(new { message = "Sadece bekleyen talepler güncellenebilir" });
            }

            // Kullanıcı sadece kendi taleplerini güncelleyebilir (admin değilse)
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (userRole != "Admin" && request.RequestedById != currentUserId)
            {
                return Forbid();
            }

            // Güncelleme
            request.Quantity = updateDto.Quantity;
            request.Priority = updateDto.Priority;
            request.Notes = updateDto.Notes;
            request.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Talep başarıyla güncellendi" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStockRequest(int id)
        {
            var request = await _context.StockRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound();
            }

            // Sadece bekleyen talepler silinebilir
            if (request.Status != "pending")
            {
                return BadRequest(new { message = "Sadece bekleyen talepler iptal edilebilir" });
            }

            // Kullanıcı sadece kendi taleplerini silebilir (admin değilse)
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (userRole != "Admin" && request.RequestedById != currentUserId)
            {
                return Forbid();
            }

            _context.StockRequests.Remove(request);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Talep başarıyla iptal edildi" });
        }
    }

    public class CreateStockRequestDTO
    {
        public int ProductId { get; set; }
        public string RequestedById { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Priority { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateStockRequestDTO
    {
        public int Quantity { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
