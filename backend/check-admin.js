import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function getAdmin() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, status')
    .eq('role', 'admin');
    
  console.log("Admin Users:", users);
  
  if (users && users.length === 0) {
    console.log("No admin users found. You can sign up normally and I will update your role to admin.");
  }
}

getAdmin();
