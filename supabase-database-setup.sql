-- Supabase Database Setup - Ana Tablolar
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Categories tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  price DECIMAL(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  minimum_stock_level INTEGER DEFAULT 10,
  size TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Stock transactions tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.stock_transactions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  transaction_type INTEGER NOT NULL, -- 1: Giriş, 2: Çıkış
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Stock requests tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.stock_requests (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  requested_quantity INTEGER NOT NULL,
  request_reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requested_by_name TEXT,
  approved_by_name TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- 5. RLS'yi etkinleştir
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_requests ENABLE ROW LEVEL SECURITY;

-- 6. Categories için RLS politikaları
CREATE POLICY "Categories are viewable by everyone" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Categories are insertable by admins" ON public.categories
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Categories are updatable by admins" ON public.categories
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Categories are deletable by admins" ON public.categories
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 7. Products için RLS politikaları
CREATE POLICY "Products are viewable by everyone" ON public.products
FOR SELECT USING (true);

CREATE POLICY "Products are insertable by admins" ON public.products
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Products are updatable by admins" ON public.products
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Products are deletable by admins" ON public.products
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 8. Stock transactions için RLS politikaları
CREATE POLICY "Stock transactions are viewable by admins" ON public.stock_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Stock transactions are insertable by admins" ON public.stock_transactions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 9. Stock requests için RLS politikaları
CREATE POLICY "Stock requests are viewable by everyone" ON public.stock_requests
FOR SELECT USING (true);

CREATE POLICY "Stock requests are insertable by everyone" ON public.stock_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Stock requests are updatable by admins" ON public.stock_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 10. Örnek kategori ekle
INSERT INTO public.categories (name, description) VALUES 
('Elektronik', 'Elektronik ürünler'),
('Giyim', 'Giyim ürünleri'),
('Ev & Yaşam', 'Ev ve yaşam ürünleri')
ON CONFLICT DO NOTHING;

-- 11. Örnek ürün ekle
INSERT INTO public.products (name, description, category_id, price, stock_quantity, minimum_stock_level) VALUES 
('Laptop', 'Dizüstü bilgisayar', 1, 15000.00, 10, 5),
('T-Shirt', 'Pamuklu t-shirt', 2, 50.00, 100, 20),
('Masa Lambası', 'LED masa lambası', 3, 200.00, 25, 10)
ON CONFLICT DO NOTHING;

-- 12. Sonuç kontrolü
SELECT 
  'Database setup completed!' as message,
  (SELECT COUNT(*) FROM public.categories) as categories_count,
  (SELECT COUNT(*) FROM public.products) as products_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count;
