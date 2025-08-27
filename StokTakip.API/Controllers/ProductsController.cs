using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StokTakip.API.Data;
using StokTakip.API.DTOs;
using StokTakip.API.Models;

namespace StokTakip.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ProductListDTO>> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.IsActive);

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(p => p.Name.Contains(search) || 
                                            p.Brand!.Contains(search) || 
                                            p.Model!.Contains(search) ||
                                            p.Barcode!.Contains(search));
                }

                if (categoryId.HasValue)
                {
                    query = query.Where(p => p.CategoryId == categoryId.Value);
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var products = await query
                    .OrderBy(p => p.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new ProductDTO
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Brand = p.Brand,
                        Model = p.Model,
                        Barcode = p.Barcode,
                        Description = p.Description,
                        Price = p.Price,
                        StockQuantity = p.StockQuantity,
                        MinimumStockLevel = p.MinimumStockLevel,
                        CategoryId = p.CategoryId,
                                                 CategoryName = p.Category.Name,
                         Size = p.Size,
                         Color = p.Color,
                         CreatedAt = p.CreatedAt,
                         UpdatedAt = p.UpdatedAt,
                         IsActive = p.IsActive
                     })
                     .ToListAsync();

                 return Ok(new ProductListDTO
                {
                    Products = products,
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

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

                if (product == null)
                {
                    return NotFound(new { message = "Ürün bulunamadı" });
                }

                                 var productDTO = new ProductDTO
                 {
                     Id = product.Id,
                     Name = product.Name,
                     Brand = product.Brand,
                     Model = product.Model,
                     Barcode = product.Barcode,
                     Description = product.Description,
                     Price = product.Price,
                     StockQuantity = product.StockQuantity,
                     MinimumStockLevel = product.MinimumStockLevel,
                     CategoryId = product.CategoryId,
                     CategoryName = product.Category.Name,
                     Size = product.Size,
                     Color = product.Color,
                     CreatedAt = product.CreatedAt,
                     UpdatedAt = product.UpdatedAt,
                     IsActive = product.IsActive
                 };

                return Ok(productDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDTO>> CreateProduct(CreateProductDTO createProductDTO)
        {
            try
            {
                var category = await _context.Categories.FindAsync(createProductDTO.CategoryId);
                if (category == null)
                {
                    return BadRequest(new { message = "Geçersiz kategori" });
                }

                var product = new Product
                {
                    Name = createProductDTO.Name,
                    Brand = createProductDTO.Brand,
                    Model = createProductDTO.Model,
                    Barcode = createProductDTO.Barcode,
                    Description = createProductDTO.Description,
                    Price = createProductDTO.Price,
                    StockQuantity = createProductDTO.StockQuantity ?? 0,
                    MinimumStockLevel = createProductDTO.MinimumStockLevel,
                    CategoryId = createProductDTO.CategoryId,
                    Size = createProductDTO.Size,
                    Color = createProductDTO.Color,
                    CreatedAt = DateTime.Now,
                    IsActive = true
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                                 var productDTO = new ProductDTO
                 {
                     Id = product.Id,
                     Name = product.Name,
                     Brand = product.Brand,
                     Model = product.Model,
                     Barcode = product.Barcode,
                     Description = product.Description,
                     Price = product.Price,
                     StockQuantity = product.StockQuantity,
                     MinimumStockLevel = product.MinimumStockLevel,
                     CategoryId = product.CategoryId,
                     CategoryName = category.Name,
                     Size = product.Size,
                     Color = product.Color,
                     CreatedAt = product.CreatedAt,
                     IsActive = product.IsActive
                 };

                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDTO updateProductDTO)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = "Ürün bulunamadı" });
                }

                var category = await _context.Categories.FindAsync(updateProductDTO.CategoryId);
                if (category == null)
                {
                    return BadRequest(new { message = "Geçersiz kategori" });
                }

                product.Name = updateProductDTO.Name;
                product.Brand = updateProductDTO.Brand;
                product.Model = updateProductDTO.Model;
                product.Barcode = updateProductDTO.Barcode;
                product.Description = updateProductDTO.Description;
                product.Price = updateProductDTO.Price;
                product.StockQuantity = updateProductDTO.StockQuantity ?? product.StockQuantity;
                product.MinimumStockLevel = updateProductDTO.MinimumStockLevel;
                product.CategoryId = updateProductDTO.CategoryId;
                product.Size = updateProductDTO.Size;
                product.Color = updateProductDTO.Color;
                product.UpdatedAt = DateTime.Now;

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
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = "Ürün bulunamadı" });
                }

                product.IsActive = false;
                product.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<List<ProductDTO>>> GetLowStockProducts()
        {
            try
            {
                var products = await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.IsActive && p.StockQuantity <= p.MinimumStockLevel)
                    .OrderBy(p => p.StockQuantity)
                    .Select(p => new ProductDTO
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Brand = p.Brand,
                        Model = p.Model,
                        Barcode = p.Barcode,
                        Description = p.Description,
                        Price = p.Price,
                        StockQuantity = p.StockQuantity,
                        MinimumStockLevel = p.MinimumStockLevel,
                        CategoryId = p.CategoryId,
                                             CategoryName = p.Category.Name,
                     Size = p.Size,
                     Color = p.Color,
                     CreatedAt = p.CreatedAt,
                     UpdatedAt = p.UpdatedAt,
                     IsActive = p.IsActive
                 })
                 .ToListAsync();

             return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu: " + ex.Message });
            }
        }
    }
}

