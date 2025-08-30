-- Ana Admin Hesabı Kurulumu ve Kontrol

-- 1. Mevcut kullanıcıları kontrol et
SELECT 
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  p.is_admin_request_pending,
  p.admin_request_date
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at;

-- 2. Ana admin hesabını oluştur (eğer yoksa)
-- Önce auth.users tablosuna ekle
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@stoktakip.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"firstName":"Admin","lastName":"User","phoneNumber":"0555 123 45 67","role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 3. Ana admin profili oluştur (eğer yoksa)
INSERT INTO public.profiles (id, first_name, last_name, phone_number, role, is_admin_request_pending)
SELECT 
  u.id,
  'Admin',
  'User',
  '0555 123 45 67',
  'admin',
  FALSE
FROM auth.users u
WHERE u.email = 'admin@stoktakip.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = u.id
);

-- 4. Ana admin hesabını güncelle
UPDATE public.profiles 
SET 
  role = 'admin',
  is_admin_request_pending = FALSE,
  admin_request_date = NULL,
  admin_rejection_reason = NULL,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@stoktakip.com'
);

-- 5. Son durumu kontrol et
SELECT 
  'Ana Admin Hesabı Kurulumu Tamamlandı!' as message,
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  p.is_admin_request_pending
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@stoktakip.com';

-- 6. Tüm kullanıcıları listele
SELECT 
  'Tüm Kullanıcılar:' as info,
  COUNT(*) as total_users,
  COUNT(CASE WHEN p.role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN p.is_admin_request_pending = TRUE THEN 1 END) as pending_requests
FROM auth.users u
JOIN public.profiles p ON u.id = p.id;


