using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StokTakip.API.Data;
using StokTakip.API.Models;

namespace StokTakip.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Category>>> GetCategories()
        {
            try
            {
                var categories = await _context.Categories
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.Name)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Description,
                        c.CreatedAt,
                        c.IsActive,
                        ProductCount = _context.Products.Count(p => p.CategoryId == c.Id && p.IsActive)
                    })
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            try
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

                if (category == null)
                {
                    return NotFound(new { message = "Kategori bulunamadı" });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Category>> CreateCategory(Category category)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(category.Name))
                {
                    return BadRequest(new { message = "Kategori adı gereklidir" });
                }

                var existingCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == category.Name.ToLower() && c.IsActive);

                if (existingCategory != null)
                {
                    return BadRequest(new { message = "Bu kategori adı zaten mevcut" });
                }

                category.CreatedAt = DateTime.Now;
                category.IsActive = true;

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, Category category)
        {
            try
            {
                var existingCategory = await _context.Categories.FindAsync(id);
                if (existingCategory == null)
                {
                    return NotFound(new { message = "Kategori bulunamadı" });
                }

                if (string.IsNullOrWhiteSpace(category.Name))
                {
                    return BadRequest(new { message = "Kategori adı gereklidir" });
                }

                var duplicateCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == category.Name.ToLower() && 
                                             c.Id != id && 
                                             c.IsActive);

                if (duplicateCategory != null)
                {
                    return BadRequest(new { message = "Bu kategori adı zaten mevcut" });
                }

                existingCategory.Name = category.Name;
                existingCategory.Description = category.Description;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);
                if (category == null)
                {
                    return NotFound(new { message = "Kategori bulunamadı" });
                }

                // Kategoriye ait ürün var mı kontrol et
                var hasProducts = await _context.Products
                    .AnyAsync(p => p.CategoryId == id && p.IsActive);

                if (hasProducts)
                {
                    return BadRequest(new { message = "Bu kategoriye ait ürünler bulunduğu için silinemez" });
                }

                category.IsActive = false;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }
    }
}

