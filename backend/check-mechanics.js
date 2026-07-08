import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('repair_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
    
  console.log("Latest Request:", data);
}

check();
