const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/Workspace/roadfixnow-demo/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDB() {
  const { data, error } = await supabase.from('repair_requests').select('*').limit(10);
  if (error) console.error("Error:", error);
  else console.log("Data:", JSON.stringify(data, null, 2));
}

checkDB();
