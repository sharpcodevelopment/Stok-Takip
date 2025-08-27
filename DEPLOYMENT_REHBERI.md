# 🚀 DEPLOYMENT REHBERİ - Canlıya Alma Kılavuzu

## 📋 MEVCUT DURUM

### Şu Anki Veritabanı Konfigürasyonu:
- **Sunucu:** SRGN-ALDG1 (Local bilgisayarınız)
- **Veritabanı:** StokTakipDb  
- **Kimlik Doğrulama:** Windows Authentication (şifre yok)

## 🛠️ CANLIYA ALMA ADIMLARı

### 1. 🗄️ VERITABANI HAZIRLIĞI

#### A) SQL Server'da Yeni Kullanıcı Oluşturun:
```sql
-- SQL Server Management Studio'da çalıştırın:
CREATE LOGIN stok_user WITH PASSWORD = 'GucluSifre123!';
CREATE USER stok_user FOR LOGIN stok_user;
GRANT db_owner TO stok_user;
```

#### B) Veritabanını Servera Taşıyın:
```sql
-- 1. Local veritabanını backup alın
BACKUP DATABASE StokTakipDb TO DISK = 'C:\temp\StokTakipDb.bak'

-- 2. Server'da restore edin
RESTORE DATABASE StokTakipDb FROM DISK = 'C:\server\path\StokTakipDb.bak'
```

### 2. 🔧 ENVIRONMENT VARIABLES AYARI

#### A) Sunucuda Environment Variables oluşturun:
```bash
# Windows Server'da (PowerShell as Administrator):
[Environment]::SetEnvironmentVariable("ConnectionStrings__DefaultConnection", "Server=SUNUCU_IP;Database=StokTakipDb;User Id=stok_user;Password=GucluSifre123!;TrustServerCertificate=True;", "Machine")

[Environment]::SetEnvironmentVariable("JwtSettings__SecretKey", "SuperSecureJwtKeyForProduction123456789!@#$%", "Machine")

# Linux'ta:
export ConnectionStrings__DefaultConnection="Server=localhost;Database=StokTakipDb;User Id=stok_user;Password=GucluSifre123!;TrustServerCertificate=True;"
export JwtSettings__SecretKey="SuperSecureJwtKeyForProduction123456789!@#$%"
```

#### B) Docker kullanıyorsanız (.env dosyası):
```env
ConnectionStrings__DefaultConnection=Server=db_server;Database=StokTakipDb;User Id=stok_user;Password=GucluSifre123!;TrustServerCertificate=True;
JwtSettings__SecretKey=SuperSecureJwtKeyForProduction123456789!@#$%
```

### 3. 📱 REACT UYGULAMASI

#### A) Production API URL'i ayarlayın:
```javascript
// api.js dosyasında:
const API_BASE_URL = 'https://yourdomain.com/api'; // localhost yerine
```

#### B) Build alın:
```bash
npm run build
```

### 4. 🌐 IIS/NGINX KONFIGÜRASYONU

#### A) IIS için:
```xml
<!-- web.config -->
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### 5. 🔒 GÜVENLİK KONTROLLERİ

#### A) appsettings.json kontrol:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "" // BOŞ OLMALI!
  },
  "JwtSettings": {
    "SecretKey": "" // BOŞ OLMALI!
  }
}
```

#### B) .gitignore kontrol:
```
✅ appsettings.json .gitignore'da
✅ .env dosyaları .gitignore'da  
✅ bin/ ve obj/ klasörleri .gitignore'da
```

## ⚠️ GÜVENLİK UYARILARI

### 🚫 ASLA GitHub'a YÜKLEMEYIN:
- Gerçek veritabanı şifreleri
- Production JWT secret key'leri
- .env dosyaları (gerçek verilerle)
- appsettings.json (gerçek verilerle)

### ✅ DEPLOYMENT CHECKLIST:

- [ ] Veritabanı server'a taşındı
- [ ] SQL Server kullanıcısı oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] JWT secret key üretildi (en az 32 karakter)
- [ ] React build alındı
- [ ] API URL'leri güncellendi
- [ ] IIS/Nginx konfigüre edildi
- [ ] HTTPS sertifikası kuruldu
- [ ] Firewall ayarları yapıldı
- [ ] appsettings.json boş bırakıldı
- [ ] .gitignore kontrol edildi

## 🎯 ÖRNEK PRODUCTION KONFIGÜRASYONU

### Environment Variables:
```
ConnectionStrings__DefaultConnection=Server=prod-sql-server;Database=StokTakipDb;User Id=stok_prod_user;Password=VeryStrongPassword123!@#;TrustServerCertificate=True;

JwtSettings__SecretKey=MyVerySecureProductionJwtSecretKey123456789!@#$%^&*()
```

### CORS Ayarları (Program.cs):
```csharp
// Production domain'inizi ekleyin:
policy.WithOrigins("https://yourdomain.com", "https://www.yourdomain.com")
```

## 📞 SORUN GİDERME

### Veritabanı Bağlantı Sorunu:
1. SQL Server çalışıyor mu?
2. Firewall SQL Server portuna (1433) açık mı?
3. Environment variables doğru mu?

### API Erişim Sorunu:
1. CORS ayarları doğru mu?
2. HTTPS kullanıyor musunuz?
3. JWT secret key ayarlandı mı?

Bu rehberi takip ederek güvenli bir şekilde canlıya alabilirsiniz! 🚀
