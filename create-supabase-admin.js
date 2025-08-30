// Supabase Admin Hesabı Oluşturma Script'i
// Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Önce admin request sistemi için gerekli alanları ekleyelim
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS is_admin_request_pending BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_request_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_rejection_reason TEXT;

-- 2. Ana admin hesabını oluşturalım (eğer yoksa)
-- Not: Bu işlem Supabase Dashboard > Authentication > Users bölümünden manuel olarak da yapılabilir

-- 3. Ana admin hesabını güncelleyelim (eğer varsa)
UPDATE auth.users 
SET 
  raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "firstName": "Admin", "lastName": "User", "phoneNumber": "0555 123 45 67"}'::jsonb,
  is_admin_request_pending = FALSE,
  admin_request_date = NULL,
  admin_rejection_reason = NULL
WHERE email = 'admin@stoktakip.com';

-- 4. RPC fonksiyonlarını oluşturalım
CREATE OR REPLACE FUNCTION get_admin_requests()
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  admin_request_date TIMESTAMP WITH TIME ZONE,
  role TEXT
) AS $$
BEGIN
  -- Sadece admin'ler bu fonksiyonu kullanabilir
  IF (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view admin requests';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    (u.raw_user_meta_data ->> 'firstName')::TEXT as first_name,
    (u.raw_user_meta_data ->> 'lastName')::TEXT as last_name,
    (u.raw_user_meta_data ->> 'phoneNumber')::TEXT as phone_number,
    u.admin_request_date,
    (u.raw_user_meta_data ->> 'role')::TEXT as role
  FROM auth.users u
  WHERE u.is_admin_request_pending = TRUE
  ORDER BY u.admin_request_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Admin request onaylama fonksiyonu
CREATE OR REPLACE FUNCTION approve_admin_request(
  user_id UUID,
  is_approved BOOLEAN,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Sadece admin'ler bu fonksiyonu kullanabilir
  IF (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can approve admin requests';
  END IF;
  
  -- Kullanıcıyı güncelle
  UPDATE auth.users 
  SET 
    is_admin_request_pending = FALSE,
    admin_request_date = NULL,
    admin_rejection_reason = CASE WHEN is_approved THEN NULL ELSE rejection_reason END,
    raw_user_meta_data = CASE 
      WHEN is_approved THEN 
        raw_user_meta_data || '{"role": "admin"}'::jsonb
      ELSE 
        raw_user_meta_data || '{"role": "user"}'::jsonb
    END
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Admin request oluşturma trigger'ı
CREATE OR REPLACE FUNCTION create_admin_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer kullanıcı admin olarak kayıt oluyorsa
  IF (NEW.raw_user_meta_data ->> 'role') = 'admin' THEN
    NEW.is_admin_request_pending = TRUE;
    NEW.admin_request_date = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger'ı oluştur
DROP TRIGGER IF EXISTS trigger_create_admin_request ON auth.users;
CREATE TRIGGER trigger_create_admin_request
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_admin_request();

-- 8. RLS politikalarını oluştur
CREATE POLICY "Admin requests viewable by admins only" ON auth.users
FOR SELECT USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "Admin requests manageable by admins only" ON auth.users
FOR UPDATE USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- 9. Sonuç kontrolü
SELECT 
  'Admin request sistemi kuruldu!' as message,
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_admin_request_pending = TRUE THEN 1 END) as pending_requests
FROM auth.users;


