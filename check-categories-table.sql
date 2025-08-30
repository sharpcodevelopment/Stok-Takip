-- Categories tablosunun yapısını kontrol etme
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Categories tablosundaki mevcut verileri kontrol etme
SELECT * FROM categories LIMIT 5;
