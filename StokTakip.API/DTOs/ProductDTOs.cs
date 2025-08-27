using System.ComponentModel.DataAnnotations;

namespace StokTakip.API.DTOs
{
    public class CreateProductDTO
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? Brand { get; set; }
        
        [StringLength(50)]
        public string? Model { get; set; }
        
        [StringLength(20)]
        public string? Barcode { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Range(0, int.MaxValue)]
        public int? StockQuantity { get; set; }
        
        [Range(0, int.MaxValue)]
        public int MinimumStockLevel { get; set; } = 10;
        
        [Required]
        public int CategoryId { get; set; }
        
        [StringLength(50)]
        public string? Size { get; set; }
        
        [StringLength(50)]
        public string? Color { get; set; }
    }

    public class UpdateProductDTO
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? Brand { get; set; }
        
        [StringLength(50)]
        public string? Model { get; set; }
        
        [StringLength(20)]
        public string? Barcode { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Range(0, int.MaxValue)]
        public int? StockQuantity { get; set; }
        
        [Range(0, int.MaxValue)]
        public int MinimumStockLevel { get; set; }
        
        [Required]
        public int CategoryId { get; set; }
        
        [StringLength(50)]
        public string? Size { get; set; }
        
        [StringLength(50)]
        public string? Color { get; set; }
    }

    public class ProductDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Barcode { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public int MinimumStockLevel { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? Size { get; set; }
        public string? Color { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsLowStock => StockQuantity <= MinimumStockLevel;
    }

    public class ProductListDTO
    {
        public List<ProductDTO> Products { get; set; } = new List<ProductDTO>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}

