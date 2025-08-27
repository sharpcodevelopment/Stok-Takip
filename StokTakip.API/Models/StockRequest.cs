using System.ComponentModel.DataAnnotations;

namespace StokTakip.API.Models
{
    public class StockRequest
    {
        public int Id { get; set; }
        
        [Required]
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
        
        [Required]
        public string RequestedById { get; set; } = string.Empty;
        public ApplicationUser RequestedBy { get; set; } = null!;
        
        [Required]
        public int Quantity { get; set; }
        
        [Required]
        public string Priority { get; set; } = "normal"; // low, normal, high, urgent
        
        public string? Notes { get; set; }
        
        public string? RejectionReason { get; set; }
        
        [Required]
        public string Status { get; set; } = "pending"; // pending, approved, rejected, completed
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        
        public string? ApprovedById { get; set; }
        public ApplicationUser? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
    }
}
