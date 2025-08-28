using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StokTakip.API.DTOs;
using StokTakip.API.Models;
using StokTakip.API.Services;

namespace StokTakip.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtService _jwtService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            JwtService jwtService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PhoneNumber = registerDto.PhoneNumber ?? string.Empty
            };

            // Eğer admin kayıt ise, admin onay bekleme durumunu ayarla
            if (registerDto.IsAdminRegistration)
            {
                user.IsAdminRequestPending = true;
                user.AdminRequestDate = DateTime.Now;
            }

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (result.Succeeded)
            {
                // Varsayılan olarak User rolünü ata (Admin değil)
                await _userManager.AddToRoleAsync(user, "User");
                
                var token = await _jwtService.GenerateTokenAsync(user);
                
                if (registerDto.IsAdminRegistration)
                {
                    return Ok(new { 
                        token, 
                        message = "Admin olma talebiniz alındı. Ana admin onayı bekleniyor.",
                        isAdminRequestPending = true
                    });
                }
                else
                {
                    return Ok(new { token, message = "Kullanıcı başarıyla kaydedildi." });
                }
            }

            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
                return BadRequest(new { message = "Geçersiz email veya şifre." });

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (result.Succeeded)
            {
                // Sadece admin@stoktakip.com hesabı ve doğru şifre ile Admin rolü ver ve SuperAdmin olarak işaretle
                if (loginDto.Email == "admin@stoktakip.com" && loginDto.Password == "Admin123!")
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    
                    if (!roles.Contains("Admin"))
                    {
                        await _userManager.AddToRoleAsync(user, "Admin");
                    }

                    // SuperAdmin olarak işaretle
                    if (!user.IsSuperAdmin)
                    {
                        user.IsSuperAdmin = true;
                        await _userManager.UpdateAsync(user);
                    }
                }
                
                var token = await _jwtService.GenerateTokenAsync(user);
                return Ok(new { token, message = "Giriş başarılı." });
            }

            return BadRequest(new { message = "Geçersiz email veya şifre." });
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.PhoneNumber,
                user.IsSuperAdmin,
                user.IsAdminRequestPending,
                user.AdminRequestDate,
                Roles = roles
            });
        }

        // Admin onay taleplerini listele (sadece SuperAdmin görebilir)
        [HttpGet("admin-requests")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminRequests()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null || !currentUser.IsSuperAdmin)
                return Forbid("Sadece ana admin bu işlemi yapabilir");

            var pendingRequests = await _userManager.Users
                .Where(u => u.IsAdminRequestPending)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.PhoneNumber,
                    u.AdminRequestDate,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(pendingRequests);
        }

        // Admin onay/red işlemi (sadece SuperAdmin yapabilir)
        [HttpPost("approve-admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveAdmin([FromBody] AdminApprovalDTO approvalDto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null || !currentUser.IsSuperAdmin)
                return Forbid("Sadece ana admin bu işlemi yapabilir");

            var user = await _userManager.FindByIdAsync(approvalDto.UserId);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı" });

            // Kendisini onaylamaya çalışıyor mu kontrol et
            if (user.Id == currentUser.Id)
                return BadRequest(new { message = "Kendinizi onaylayamazsınız" });

            if (!user.IsAdminRequestPending)
                return BadRequest(new { message = "Bu kullanıcının admin olma talebi bulunmuyor" });

            if (approvalDto.IsApproved)
            {
                // Kullanıcının zaten admin olup olmadığını kontrol et
                var userRoles = await _userManager.GetRolesAsync(user);
                if (userRoles.Contains("Admin"))
                {
                    return BadRequest(new { message = "Bu kullanıcı zaten admin rolüne sahip" });
                }
                
                // Admin olarak onayla
                user.IsAdminRequestPending = false;
                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    // Admin rolünü ekle
                    await _userManager.AddToRoleAsync(user, "Admin");
                    
                    // Email bildirimi gönder (opsiyonel)
                    // await _emailService.SendAdminApprovalEmailAsync(user.Email, user.FirstName);
                    
                    return Ok(new { message = "Kullanıcı admin olarak onaylandı" });
                }
                return BadRequest(new { message = "Onay işlemi sırasında hata oluştu" });
            }
            else
            {
                // Admin olma talebini reddet
                user.IsAdminRequestPending = false;

                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    // Email bildirimi gönder (opsiyonel)
                    // await _emailService.SendAdminRejectionEmailAsync(user.Email, user.FirstName, approvalDto.RejectionReason);
                    
                    return Ok(new { message = "Admin olma talebi reddedildi" });
                }
                return BadRequest(new { message = "Red işlemi sırasında hata oluştu" });
            }
        }

        [HttpPost("make-admin/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MakeAdmin(string userId)
        {
            // Sadece SuperAdmin admin yapabilir
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null || !currentUser.IsSuperAdmin)
                return Forbid("Sadece ana admin bu işlemi yapabilir");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı" });

            var result = await _userManager.AddToRoleAsync(user, "Admin");
            if (result.Succeeded)
            {
                return Ok(new { message = "Kullanıcı Admin rolüne eklendi" });
            }

            return BadRequest(new { message = "Rol eklenirken hata oluştu" });
        }

        [HttpPost("remove-admin/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveAdmin(string userId)
        {
            // Current user kontrolü
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
                return Unauthorized();

            // Sadece SuperAdmin admin rolü kaldırabilir
            if (!currentUser.IsSuperAdmin)
                return Forbid("Sadece ana admin bu işlemi yapabilir");

            // Kendisini admin'den çıkarmaya çalışıyor mu kontrol et
            if (currentUser.Id == userId)
                return BadRequest(new { message = "Kendi admin rolünüzü kaldıramazsınız" });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı" });

            // SuperAdmin'den admin rolü kaldırılamaz
            if (user.IsSuperAdmin)
                return BadRequest(new { message = "Ana admin'den admin rolü kaldırılamaz" });

            var result = await _userManager.RemoveFromRoleAsync(user, "Admin");
            if (result.Succeeded)
            {
                return Ok(new { message = "Kullanıcıdan Admin rolü kaldırıldı" });
            }

            return BadRequest(new { message = "Rol kaldırılırken hata oluştu" });
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _userManager.Users.ToListAsync();
                
                var userList = new List<object>();
                
                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    userList.Add(new
                    {
                        user.Id,
                        user.Email,
                        user.FirstName,
                        user.LastName,
                        user.PhoneNumber,
                        user.CreatedAt,
                        user.IsSuperAdmin,
                        user.IsAdminRequestPending,
                        user.AdminRequestDate,
                        Roles = roles
                    });
                }

                return Ok(userList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kullanıcılar alınırken hata oluştu: " + ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var token = await _jwtService.GenerateTokenAsync(user);
            return Ok(new { token, message = "Token yenilendi" });
        }
    }
}
