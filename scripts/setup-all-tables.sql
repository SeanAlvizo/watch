-- Create activity_log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('system', 'customer', 'sale', 'inventory')),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable RLS for activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for activity_log
CREATE POLICY "Allow public read" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.activity_log FOR INSERT WITH CHECK (true);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable RLS for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policies for customers
CREATE POLICY "Allow public read" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.customers FOR UPDATE USING (true) WITH CHECK (true);

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  watch_id UUID NOT NULL REFERENCES public.watches(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  sale_price INTEGER NOT NULL,
  payment_method TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')),
  sold_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable RLS for sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Policies for sales
CREATE POLICY "Allow public read" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.sales FOR UPDATE USING (true) WITH CHECK (true);

-- Ensure watches table has proper RLS
ALTER TABLE public.watches ENABLE ROW LEVEL SECURITY;

-- Recreate policies for watches (in case they don't exist)
DROP POLICY IF EXISTS "Allow public read access" ON public.watches;
DROP POLICY IF EXISTS "Allow public insert" ON public.watches;

CREATE POLICY "Allow public read access" ON public.watches FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.watches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.watches FOR UPDATE USING (true) WITH CHECK (true);
