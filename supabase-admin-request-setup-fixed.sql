-- Supabase Admin Request System Setup (Fixed)
-- auth.users tablosunu değiştirmek yerine ayrı profiles tablosu kullanıyoruz

-- 1. Profiles tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  role TEXT DEFAULT 'user',
  is_admin_request_pending BOOLEAN DEFAULT FALSE,
  admin_request_date TIMESTAMP WITH TIME ZONE,
  admin_rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS'yi etkinleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS politikalarını oluştur
-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Admin'ler tüm profilleri görebilir
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin'ler tüm profilleri güncelleyebilir
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Trigger: Yeni kullanıcı kaydında otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone_number, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName',
    NEW.raw_user_meta_data->>'phoneNumber',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  
  -- Eğer admin olarak kayıt oluyorsa admin request oluştur
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    UPDATE public.profiles 
    SET 
      is_admin_request_pending = TRUE,
      admin_request_date = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger'ı oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RPC fonksiyonu: Admin request'leri getir
CREATE OR REPLACE FUNCTION public.get_admin_requests()
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
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view admin requests';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    u.email,
    p.first_name,
    p.last_name,
    p.phone_number,
    p.admin_request_date,
    p.role
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.is_admin_request_pending = TRUE
  ORDER BY p.admin_request_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Admin request onaylama fonksiyonu
CREATE OR REPLACE FUNCTION public.approve_admin_request(
  user_id UUID,
  is_approved BOOLEAN,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Sadece admin'ler bu fonksiyonu kullanabilir
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can approve admin requests';
  END IF;
  
  -- Profili güncelle
  UPDATE public.profiles 
  SET 
    is_admin_request_pending = FALSE,
    admin_request_date = NULL,
    admin_rejection_reason = CASE WHEN is_approved THEN NULL ELSE rejection_reason END,
    role = CASE WHEN is_approved THEN 'admin' ELSE 'user' END,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Mevcut kullanıcılar için profil oluştur (eğer yoksa)
INSERT INTO public.profiles (id, first_name, last_name, phone_number, role)
SELECT 
  u.id,
  u.raw_user_meta_data->>'firstName',
  u.raw_user_meta_data->>'lastName',
  u.raw_user_meta_data->>'phoneNumber',
  COALESCE(u.raw_user_meta_data->>'role', 'user')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = u.id
);

-- 9. Ana admin hesabını güncelle (eğer varsa)
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

-- 10. Sonuç kontrolü
SELECT 
  'Admin request sistemi kuruldu!' as message,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_admin_request_pending = TRUE THEN 1 END) as pending_requests,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins
FROM public.profiles;

