using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StokTakip.API.Data;
using StokTakip.API.DTOs;
using StokTakip.API.Models;
using System.Security.Claims;

namespace StokTakip.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StockTransactionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public StockTransactionsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<StockTransactionListDTO>> GetTransactions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? productId = null,
            [FromQuery] TransactionType? transactionType = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var query = _context.StockTransactions
                    .Include(t => t.Product)
                    .Include(t => t.User)
                    .AsQueryable();

                if (productId.HasValue)
                {
                    query = query.Where(t => t.ProductId == productId.Value);
                }

                if (transactionType.HasValue)
                {
                    query = query.Where(t => t.TransactionType == transactionType.Value);
                }

                if (startDate.HasValue)
                {
                    query = query.Where(t => t.TransactionDate >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(t => t.TransactionDate <= endDate.Value);
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var transactions = await query
                    .OrderByDescending(t => t.TransactionDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => new StockTransactionDTO
                    {
                        Id = t.Id,
                        ProductId = t.ProductId,
                        ProductName = t.Product.Name,
                        TransactionType = t.TransactionType,
                        Quantity = t.Quantity,
                        UnitPrice = t.UnitPrice,
                        Notes = t.Notes,
                        UserId = t.UserId,
                        UserName = t.User != null ? $"{t.User.FirstName} {t.User.LastName}" : null,
                        TransactionDate = t.TransactionDate
                    })
                    .ToListAsync();

                return Ok(new StockTransactionListDTO
                {
                    Transactions = transactions,
                    TotalCount = totalCount,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<StockTransactionDTO>> CreateTransaction(CreateStockTransactionDTO createTransactionDTO)
        {
            try
            {
                var product = await _context.Products.FindAsync(createTransactionDTO.ProductId);
                if (product == null)
                {
                    return BadRequest(new { message = "Ürün bulunamadı" });
                }

                // Stok çıkışı için yeterli stok kontrolü
                if (createTransactionDTO.TransactionType == TransactionType.Out)
                {
                    if (product.StockQuantity < createTransactionDTO.Quantity)
                    {
                        return BadRequest(new { message = "Yetersiz stok" });
                    }
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var user = userId != null ? await _userManager.FindByIdAsync(userId) : null;

                var transaction = new StockTransaction
                {
                    ProductId = createTransactionDTO.ProductId,
                    TransactionType = createTransactionDTO.TransactionType,
                    Quantity = createTransactionDTO.Quantity,
                    UnitPrice = createTransactionDTO.UnitPrice,
                    Notes = createTransactionDTO.Notes,
                    UserId = userId,
                    TransactionDate = DateTime.Now
                };

                _context.StockTransactions.Add(transaction);

                // Stok miktarını güncelle
                if (createTransactionDTO.TransactionType == TransactionType.In)
                {
                    product.StockQuantity += createTransactionDTO.Quantity;
                }
                else
                {
                    product.StockQuantity -= createTransactionDTO.Quantity;
                }

                product.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                var transactionDTO = new StockTransactionDTO
                {
                    Id = transaction.Id,
                    ProductId = transaction.ProductId,
                    ProductName = product.Name,
                    TransactionType = transaction.TransactionType,
                    Quantity = transaction.Quantity,
                    UnitPrice = transaction.UnitPrice,
                    Notes = transaction.Notes,
                    UserId = transaction.UserId,
                    UserName = user != null ? $"{user.FirstName} {user.LastName}" : null,
                    TransactionDate = transaction.TransactionDate
                };

                return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transactionDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StockTransactionDTO>> GetTransaction(int id)
        {
            try
            {
                var transaction = await _context.StockTransactions
                    .Include(t => t.Product)
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (transaction == null)
                {
                    return NotFound(new { message = "İşlem bulunamadı" });
                }

                var transactionDTO = new StockTransactionDTO
                {
                    Id = transaction.Id,
                    ProductId = transaction.ProductId,
                    ProductName = transaction.Product.Name,
                    TransactionType = transaction.TransactionType,
                    Quantity = transaction.Quantity,
                    UnitPrice = transaction.UnitPrice,
                    Notes = transaction.Notes,
                    UserId = transaction.UserId,
                    UserName = transaction.User != null ? $"{transaction.User.FirstName} {transaction.User.LastName}" : null,
                    TransactionDate = transaction.TransactionDate
                };

                return Ok(transactionDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpGet("report")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<StockReportDTO>>> GetStockReport()
        {
            try
            {
                var report = await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.IsActive)
                    .Select(p => new StockReportDTO
                    {
                        ProductId = p.Id,
                        ProductName = p.Name,
                        CategoryName = p.Category.Name,
                        CurrentStock = p.StockQuantity,
                        TotalIn = p.StockTransactions.Where(t => t.TransactionType == TransactionType.In).Sum(t => t.Quantity),
                        TotalOut = p.StockTransactions.Where(t => t.TransactionType == TransactionType.Out).Sum(t => t.Quantity),
                        TotalValue = p.StockQuantity * p.Price,
                        IsLowStock = p.StockQuantity <= p.MinimumStockLevel
                    })
                    .OrderBy(r => r.IsLowStock)
                    .ThenBy(r => r.CurrentStock)
                    .ToListAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }
    }
}
