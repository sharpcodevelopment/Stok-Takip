using System.ComponentModel.DataAnnotations;
using StokTakip.API.Models;

namespace StokTakip.API.DTOs
{
    public class CreateStockTransactionDTO
    {
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        public TransactionType TransactionType { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? UnitPrice { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class StockTransactionDTO
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public TransactionType TransactionType { get; set; }
        public int Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? Notes { get; set; }
        public string? UserId { get; set; }
        public string? UserName { get; set; }
        public DateTime TransactionDate { get; set; }
    }

    public class StockTransactionListDTO
    {
        public List<StockTransactionDTO> Transactions { get; set; } = new List<StockTransactionDTO>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class StockReportDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public int TotalIn { get; set; }
        public int TotalOut { get; set; }
        public decimal TotalValue { get; set; }
        public bool IsLowStock { get; set; }
    }
}

