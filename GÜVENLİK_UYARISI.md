# 🚨 GÜVENLİK UYARISI - GITHUB YÜKLEMEDEN ÖNCE OKUYIN!

## ⚠️ HASSİS VERİLER TEMİZLENDİ

Bu proje GitHub'a yüklenmeden önce aşağıdaki hassas veriler temizlenmiştir:

### 🔒 Temizlenen Dosyalar:
- `appsettings.json` - Veritabanı bağlantı stringi ve JWT secret key
- `appsettings.Development.json` - Development ayarları
- Console.log mesajları - Kullanıcı verileri ve API response'ları

### 📋 Canlıya Almadan Önce Yapmanız Gerekenler:

1. **appsettings.json Oluşturun:**
   ```bash
   cp appsettings.Example.json appsettings.json
   ```
   Sonra gerçek veritabanı bilgilerinizi girin.

2. **Güvenli JWT Secret Key:**
   - En az 32 karakter
   - Karışık karakterler kullanın
   - Örnek: `MyVerySecureSecretKey123456789!@#`

3. **Veritabanı Bağlantısı:**
   - Production veritabanı bilgilerinizi girin
   - `appsettings.json` dosyasına

4. **React API URL:**
   - `api.js` dosyasında localhost yerine production URL'ini kullanın

### 🛡️ Güvenlik Kontrolleri:
- ✅ Console.log'lar temizlendi
- ✅ .gitignore oluşturuldu
- ✅ appsettings.json .gitignore'da
- ✅ Example dosyaları oluşturuldu

### 📝 Deployment Checklist:
- [ ] Production veritabanını ayarla
- [ ] appsettings.json'ı gerçek bilgilerle doldur
- [ ] JWT secret key'i güvenli bir şekilde oluştur
- [ ] API URL'lerini production'a çevir
- [ ] HTTPS kullan
- [ ] Firewall ayarlarını yap

## ⛔ ASLA GitHub'A YÜKLEMEYİN:
- appsettings.json (gerçek verilerle)
- .env dosyaları (gerçek verilerle)
- Veritabanı backup'ları
- Log dosyaları
- Test script'leri (gerçek verilerle)

Bu dosyayı GitHub'a yükledikten sonra silebilirsiniz.
