import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  const email = 'test-mechanic-' + Date.now() + '@roadfixnow.com';
  console.log('Registering', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        full_name: 'Test Mechanic'
      }
    }
  });

  if (error) {
    console.error('SignUp Error:', error);
    return;
  }
  console.log('SignUp Data:', JSON.stringify(data, null, 2));

  if (data?.user) {
    const { error: dbError } = await supabase.from('users').insert([
      { id: data.user.id, email: email, full_name: 'Test Mechanic', role: 'mechanic', status: 'pending' }
    ]);
    if (dbError) {
       console.error('DB Insert Error:', dbError);
    } else {
       console.log('DB Insert Success');
    }
  }
}

test();
