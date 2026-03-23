# Supabase Setup Guide - Heritage Collection

## Step 1: Create the Watches Table

You need to create the `watches` table in your Supabase database. Follow these steps:

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query and paste the following SQL:

```sql
-- Create watches table
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
```

4. Click **Run** to execute the SQL
5. You should see a success message

## Step 2: Seed the Data

Once the table is created, run the seed script to populate the Heritage Collection:

```bash
npm run seed
```

This will add 6 premium timepieces to your collection:
- Rolex Submariner Date
- Omega Speedmaster Professional
- Patek Philippe Aquanaut
- Seiko Grand Seiko
- Jaeger-LeCoultre Reverso
- Tudor Black Bay

## What to Expect

After seeding, your Collections page will display:
- **6 exceptional timepieces** currently available for acquisition
- Filterable by movement type (Automatic, Manual, Quartz)
- Filterable by condition (Unworn, Mint, Excellent, Good)
- Sorted by price (highest to lowest)

## Environment Variables

Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

## Troubleshooting

If the seed script fails:
1. Verify the table was created successfully in SQL Editor
2. Check that RLS (Row Level Security) policies are enabled
3. Ensure your Supabase credentials are correct in `.env.local`
