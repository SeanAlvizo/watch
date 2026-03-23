import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createWatchesTable() {
  try {
    console.log('📋 Creating watches table...');

    // Since we can't run raw SQL easily with the client, we'll use RPC or provide a message
    // Instead, let's try to create using raw SQL via a manual approach
    
    const result = await supabase.rpc('create_watches_table', {});
    console.log('✅ Table created successfully');
  } catch (error: any) {
    // The RPC approach might not work, so we'll need to provide manual SQL
    if (error.message.includes('does not exist')) {
      console.log(`
⚠️  The 'watches' table doesn't exist yet.

To create it in Supabase:
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to SQL Editor
3. Run this SQL query:

---START SQL---
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

CREATE INDEX idx_watches_status ON public.watches(status);
CREATE INDEX idx_watches_brand ON public.watches(brand);
---END SQL---

After creating the table, run: npm run seed
      `);
      process.exit(1);
    }
    throw error;
  }
}

createWatchesTable();
