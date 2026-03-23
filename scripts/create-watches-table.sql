-- Create watches table for Heritage Collection
CREATE TABLE public.watches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  year INTEGER NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('unworn', 'mint', 'excellent', 'good')),
  movement TEXT NOT NULL CHECK (movement IN ('automatic', 'manual', 'quartz')),
  case_size TEXT NOT NULL,
  material TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'on_hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_watches_status ON public.watches(status);
CREATE INDEX idx_watches_brand ON public.watches(brand);

-- Enable Row Level Security
ALTER TABLE public.watches ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access" ON public.watches
  FOR SELECT USING (true);

-- Create a policy to allow inserts
CREATE POLICY "Allow public insert" ON public.watches
  FOR INSERT WITH CHECK (true);
