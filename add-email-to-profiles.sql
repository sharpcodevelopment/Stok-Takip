-- Supabase profiles tablosuna email kolonu ekleme
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Mevcut kullanıcıların email bilgilerini auth.users tablosundan al
-- Bu işlem Supabase Dashboard'da manuel olarak yapılmalı
-- veya RLS (Row Level Security) politikaları düzenlenmelidir

-- Email kolonu için index ekleme (opsiyonel)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
