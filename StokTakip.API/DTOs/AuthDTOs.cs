using System.ComponentModel.DataAnnotations;

namespace StokTakip.API.DTOs
{
    public class LoginDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterDTO
    {
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;
        
        public string? PhoneNumber { get; set; }
        
        public string? Role { get; set; } // Artık zorunlu değil, backend otomatik "User" atayacak
        
        // Admin kayıt için ek alanlar
        public bool IsAdminRegistration { get; set; } = false; // Admin kayıt mı?
    }

    // Admin onay/red DTO'su
    public class AdminApprovalDTO
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        public bool IsApproved { get; set; }
        
        public string? RejectionReason { get; set; } // Red nedeni (opsiyonel)
    }

    public class AuthResponseDTO
    {
        public bool IsSuccess { get; set; }
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserInfoDTO User { get; set; } = new UserInfoDTO();
        public string Message { get; set; } = string.Empty;
    }

    public class UserInfoDTO
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsAdminRequestPending { get; set; }
        public DateTime? AdminRequestDate { get; set; }
    }
}

