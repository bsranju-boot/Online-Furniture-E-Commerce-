-- =========================================================
-- ORDER MANAGEMENT & CUSTOMER PROFILE MIGRATION
-- Run in Supabase SQL Editor
-- =========================================================

-- 1. Update orders table with order_code, status and delivery_date
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Placed';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'COD';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';

-- 2. Create customer profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Profiles RLS Policies: User can read, insert and update only their own row
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. Orders RLS Policies
-- Users can view their own orders; admin can view all
DROP POLICY IF EXISTS "Users or admin can view orders" ON public.orders;
CREATE POLICY "Users or admin can view orders" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR auth.jwt() ->> 'email' = 'admin@aura.com'
);

-- Users can insert their own orders
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User can cancel their own order only while status is 'Placed'
DROP POLICY IF EXISTS "Users can cancel placed orders" ON public.orders;
CREATE POLICY "Users can cancel placed orders" ON public.orders FOR UPDATE USING (
  auth.uid() = user_id AND status = 'Placed'
) WITH CHECK (
  auth.uid() = user_id AND status = 'Cancelled'
);

-- Admin can update any order status and delivery date
DROP POLICY IF EXISTS "Admin can update any order" ON public.orders;
CREATE POLICY "Admin can update any order" ON public.orders FOR UPDATE USING (
  auth.jwt() ->> 'email' = 'admin@aura.com'
) WITH CHECK (
  auth.jwt() ->> 'email' = 'admin@aura.com'
);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
