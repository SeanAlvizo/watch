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

// Get email from command line or use default
const email = process.argv[2] || 'admin@example.com';
const password = 'admin123';

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');
    console.log(`📧 Email: ${email}`);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('\nYou can now log in with these credentials.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

createAdminUser();
