using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StokTakip.API.Models;

namespace StokTakip.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<StockTransaction> StockTransactions { get; set; }
        public DbSet<StockRequest> StockRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Category configuration
            builder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
            });

            // Product configuration
            builder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Brand).HasMaxLength(100);
                entity.Property(e => e.Model).HasMaxLength(50);
                entity.Property(e => e.Barcode).HasMaxLength(20);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.StockQuantity).HasDefaultValue(0);
                entity.Property(e => e.MinimumStockLevel).HasDefaultValue(10);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                // Foreign key relationship
                entity.HasOne(e => e.Category)
                    .WithMany(e => e.Products)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // StockTransaction configuration
            builder.Entity<StockTransaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionType).IsRequired();
                entity.Property(e => e.Quantity).IsRequired();
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.TransactionDate).HasDefaultValueSql("GETUTCDATE()");

                // Foreign key relationships
                entity.HasOne(e => e.Product)
                    .WithMany(e => e.StockTransactions)
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                                 entity.HasOne(e => e.User)
                     .WithMany()
                     .HasForeignKey(e => e.UserId)
                     .OnDelete(DeleteBehavior.SetNull);
             });

             // StockRequest configuration
             builder.Entity<StockRequest>(entity =>
             {
                 entity.HasKey(e => e.Id);
                 entity.Property(e => e.Quantity).IsRequired();
                 entity.Property(e => e.Priority).IsRequired().HasMaxLength(20);
                 entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                 entity.Property(e => e.Notes).HasMaxLength(500);
                 entity.Property(e => e.RejectionReason).HasMaxLength(500);
                 entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                 // Foreign key relationships
                 entity.HasOne(e => e.Product)
                     .WithMany()
                     .HasForeignKey(e => e.ProductId)
                     .OnDelete(DeleteBehavior.Restrict);

                 entity.HasOne(e => e.RequestedBy)
                     .WithMany()
                     .HasForeignKey(e => e.RequestedById)
                     .OnDelete(DeleteBehavior.Restrict);

                 entity.HasOne(e => e.ApprovedBy)
                     .WithMany()
                     .HasForeignKey(e => e.ApprovedById)
                     .OnDelete(DeleteBehavior.SetNull);
             });
        }
    }
}

