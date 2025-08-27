using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StokTakip.API.Data;

namespace StokTakip.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
                var totalCategories = await _context.Categories.CountAsync(c => c.IsActive);
                var totalTransactions = await _context.StockTransactions.CountAsync();

                return Ok(new
                {
                    totalProducts,
                    totalCategories,
                    totalTransactions
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "İstatistikler alınırken hata oluştu: " + ex.Message });
            }
        }
    }
}
