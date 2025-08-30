-- Ana admin'i belirleme
-- Bu script ile belirli kullanıcıları ana admin yapabilirsiniz

-- Mevcut ana admin'leri kontrol et
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_super_admin
FROM profiles 
WHERE role = 'admin';

-- Ana admin'i belirle (email'e göre)
UPDATE profiles 
SET is_super_admin = true
WHERE email = 'admin@stoktakip.com';

-- Başka bir kullanıcıyı da ana admin yapmak isterseniz:
-- UPDATE profiles 
-- SET is_super_admin = true
-- WHERE email = 'sergen@stoktakip.com';

-- Güncelleme sonrasını kontrol et
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_super_admin
FROM profiles 
WHERE role = 'admin';
