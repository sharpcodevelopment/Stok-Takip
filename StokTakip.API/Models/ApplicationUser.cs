using Microsoft.AspNetCore.Identity;

namespace StokTakip.API.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // "Employee" veya "Admin"
        public bool IsSuperAdmin { get; set; } = false; // Ana admin kontrolü
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;
        
        // Admin onay sistemi için alanlar
        public bool IsAdminRequestPending { get; set; } = false; // Admin olma talebi beklemede mi?
        public DateTime? AdminRequestDate { get; set; } = null; // Admin olma talebi tarihi
    }
}

