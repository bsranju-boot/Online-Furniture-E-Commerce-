-- =========================================================
-- SUPABASE SQL SCHEMA FOR AURA LUXURY FURNITURE
-- =========================================================

-- 1. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'COD',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Reviews RLS Policies
-- Anyone can view product reviews
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);

-- Logged-in users can insert a review with their user_id
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- A user can delete their own review, or admin can delete any review
DROP POLICY IF EXISTS "User or admin can delete review" ON public.reviews;
CREATE POLICY "User or admin can delete review" ON public.reviews FOR DELETE USING (
  auth.uid() = user_id OR auth.jwt() ->> 'email' = 'admin@aura.com'
);

-- 5. Orders RLS Policies
-- Logged-in users can insert their own orders
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Logged-in users can view their own orders, and admin can view all orders
DROP POLICY IF EXISTS "Users or admin can view orders" ON public.orders;
CREATE POLICY "Users or admin can view orders" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR auth.jwt() ->> 'email' = 'admin@aura.com'
);
