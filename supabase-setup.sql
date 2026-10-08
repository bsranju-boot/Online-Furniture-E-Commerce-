-- ===================================================
-- CUSTOM DATABASE SCHEMA WITHOUT SIGN-IN / AUTH
-- Paste and Run in Supabase SQL Editor
-- ===================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 2. Create Orders Table (no user_id / auth required)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INT NOT NULL
);

-- 4. Create Reviews Table (anyone can review with their name, no login required)
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Seed Initial 8 Luxury Furniture Products
INSERT INTO public.products (id, name, price, category, image, description)
VALUES
  (1, 'Imperial Velvet Sofa', 1250, 'Sofa', 'images/sofa1.jpg', 'Tufted velvet sofa with brass legs.'),
  (2, 'Regal Leather Sectional', 1850, 'Sofa', 'images/sofa2.jpg', 'Italian modular leather luxury sofa.'),
  (3, 'Majestic Oak King Bed', 2100, 'Bed', 'images/bed1.jpg', 'Smoked oak king bed frame.'),
  (4, 'Nocturne Platform Bed', 1650, 'Bed', 'images/bed2.jpg', 'Minimalist wooden bed with lighting.'),
  (5, 'Gilded Accent Lounge Chair', 680, 'Chair', 'images/chair1.jpg', 'Curved velvet armchair in gold.'),
  (6, 'Artisan Leather Dining Chair', 390, 'Chair', 'images/chair2.jpg', 'Solid walnut saddle leather chair.'),
  (7, 'Grand Marble Dining Table', 2450, 'Table', 'images/table1.jpg', 'Polished marble table with pedestals.'),
  (8, 'Executive Walnut Work Desk', 1150, 'Table', 'images/table2.jpg', 'Walnut study desk with hardware.')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, price = EXCLUDED.price, category = EXCLUDED.category, image = EXCLUDED.image, description = EXCLUDED.description;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 7. Public Access Policies (Direct database without sign in)
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert reviews" ON public.reviews;
CREATE POLICY "Public can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
