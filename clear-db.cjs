const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function clearDB() {
  const { data, error } = await supabase
    .from('repair_requests')
    .delete()
    .neq('status', 'ignore_me'); // delete everything

  if (error) console.error(error);
  else console.log("Successfully cleared all fake data!");
}

clearDB();
