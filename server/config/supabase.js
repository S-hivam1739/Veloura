import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseKey.includes('your-supabase-anon-key')
  );
};

let supabaseClient = null;

if (isSupabaseConfigured()) {
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  console.log('✅ Supabase Client initialized successfully');
} else {
  console.warn('⚠️ Supabase credentials not set or using placeholders. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

export const supabase = supabaseClient;