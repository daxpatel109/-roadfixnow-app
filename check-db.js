import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUser() {
  const { data, error } = await supabase.from('users').select('*').eq('email', 'mechanic99@gmail.com');
  console.log("DB Result:", data);
}
checkUser();
