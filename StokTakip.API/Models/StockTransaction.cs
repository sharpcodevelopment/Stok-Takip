using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StokTakip.API.Models
{
    public enum TransactionType
    {
        In,     // Stok girişi
        Out     // Stok çıkışı
    }

    public class StockTransaction
    {
        public int Id { get; set; }
        
        public int ProductId { get; set; }
        
        public TransactionType TransactionType { get; set; }
        
        public int Quantity { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? UnitPrice { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        public string? UserId { get; set; }
        
        public DateTime TransactionDate { get; set; } = DateTime.Now;
        
        // Navigation properties
        public virtual Product Product { get; set; } = null!;
        public virtual ApplicationUser? User { get; set; }
    }
}

