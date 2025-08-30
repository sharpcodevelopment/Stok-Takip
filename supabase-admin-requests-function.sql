-- Admin requests için email bilgilerini almak üzere RPC fonksiyonu
CREATE OR REPLACE FUNCTION get_admin_requests_with_email()
RETURNS TABLE (
  id UUID,
  role TEXT,
  is_admin_request_pending BOOLEAN,
  created_at TIMESTAMPTZ,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.role,
    p.is_admin_request_pending,
    p.created_at,
    p.first_name,
    p.last_name,
    p.phone_number,
    u.email
  FROM profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  WHERE p.is_admin_request_pending = true
  ORDER BY p.created_at DESC;
END;
$$;

-- Fonksiyonu çağırmak için gerekli izinler
GRANT EXECUTE ON FUNCTION get_admin_requests_with_email() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_requests_with_email() TO anon;
