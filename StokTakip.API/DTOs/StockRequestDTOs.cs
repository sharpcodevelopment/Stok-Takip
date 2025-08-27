
using System.ComponentModel.DataAnnotations;

namespace StokTakip.API.DTOs
{
    public class RejectRequestDTO
{
    [Required(ErrorMessage = "Reddetme sebebi gereklidir")]
    [StringLength(500, MinimumLength = 3, ErrorMessage = "Reddetme sebebi 3-500 karakter arasında olmalıdır")]
    public string Reason { get; set; } = string.Empty;
    }
}

