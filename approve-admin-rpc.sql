-- Admin onay işlemi için RPC fonksiyonu
CREATE OR REPLACE FUNCTION approve_admin_request(
  user_id UUID,
  is_approved BOOLEAN,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Kullanıcının var olup olmadığını kontrol et
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN json_build_object('error', 'Kullanıcı bulunamadı');
  END IF;
  
  -- Admin onay işlemi
  IF is_approved THEN
    UPDATE profiles 
    SET 
      role = 'admin',
      is_admin_request_pending = false
    WHERE id = user_id;
    
    result := json_build_object(
      'success', true,
      'message', 'Kullanıcı admin olarak onaylandı',
      'user_id', user_id
    );
  ELSE
    -- Admin red işlemi
    UPDATE profiles 
    SET 
      is_admin_request_pending = false
    WHERE id = user_id;
    
    result := json_build_object(
      'success', true,
      'message', 'Admin talebi reddedildi',
      'user_id', user_id,
      'rejection_reason', rejection_reason
    );
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Fonksiyonu çağırmak için gerekli izinler
GRANT EXECUTE ON FUNCTION approve_admin_request(UUID, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_admin_request(UUID, BOOLEAN, TEXT) TO anon;
