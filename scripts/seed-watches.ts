import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const heritageCollection = [
  {
    brand: 'Rolex',
    model: 'Submariner Date',
    reference_number: '126610LN',
    year: 2024,
    condition: 'unworn',
    movement: 'automatic',
    case_size: '41mm',
    material: 'Stainless Steel',
    price: 985000,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop',
    status: 'in_stock',
  },
  {
    brand: 'Omega',
    model: 'Speedmaster Professional',
    reference_number: '311.30.42.30.01.005',
    year: 2023,
    condition: 'mint',
    movement: 'manual',
    case_size: '42mm',
    material: 'Stainless Steel',
    price: 450000,
    image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop',
    status: 'in_stock',
  },
  {
    brand: 'Patek Philippe',
    model: 'Aquanaut',
    reference_number: '5167A',
    year: 2022,
    condition: 'excellent',
    movement: 'automatic',
    case_size: '42.2mm',
    material: 'Stainless Steel',
    price: 1250000,
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop',
    status: 'in_stock',
  },
  {
    brand: 'Seiko',
    model: 'Grand Seiko',
    reference_number: 'SBGA375',
    year: 2023,
    condition: 'unworn',
    movement: 'automatic',
    case_size: '40.5mm',
    material: 'Titanium',
    price: 350000,
    image_url: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&auto=format&fit=crop',
    status: 'in_stock',
  },
  {
    brand: 'Jaeger-LeCoultre',
    model: 'Reverso',
    reference_number: '2908470',
    year: 2023,
    condition: 'mint',
    movement: 'manual',
    case_size: '47.8×27.4mm',
    material: 'White Gold',
    price: 890000,
    image_url: 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=500&auto=format&fit=crop',
    status: 'in_stock',
  },
  {
    brand: 'Tudor',
    model: 'Black Bay',
    reference_number: 'M79230B',
    year: 2024,
    condition: 'unworn',
    movement: 'automatic',
    case_size: '41mm',
    material: 'Stainless Steel',
    price: 420000,
    image_url: 'https://images.unsplash.com/photo-1609070768818-61c68f91ae0a?w=500&auto=format&fit=crop',
    status: 'in_stock',
  },
];

async function seedWatches() {
  try {
    console.log('🕐 Seeding Heritage Collection watches...');
    
    // Insert watches
    const { data, error } = await supabase
      .from('watches')
      .insert(heritageCollection)
      .select();

    if (error) {
      console.error('❌ Error inserting watches:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully added ${data?.length || 0} watches to The Heritage Collection!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedWatches();
