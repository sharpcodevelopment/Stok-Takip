-- Profiles tablosuna is_super_admin kolonu ekleme
-- Bu script ile ana admin sistemi kurulur

-- 1. Önce mevcut profiles tablosunun yapısını kontrol et
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. is_super_admin kolonunu ekle (eğer yoksa)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- 3. Mevcut admin'leri kontrol et
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_super_admin
FROM profiles 
WHERE role = 'admin';

-- 4. Ana admin'i belirle
UPDATE profiles 
SET is_super_admin = true
WHERE email = 'sergen@stoktakip.com';

-- 5. Güncelleme sonrasını kontrol et
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_super_admin
FROM profiles 
WHERE role = 'admin';

-- 6. Tüm kullanıcıların is_super_admin durumunu kontrol et
SELECT 
  email,
  role,
  is_super_admin,
  is_admin_request_pending
FROM profiles 
ORDER BY role DESC, email;
