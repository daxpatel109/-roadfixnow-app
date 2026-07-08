import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('email, role, full_name');
  if (error) console.error(error);
  else console.log(data);
}

fetchUsers();
