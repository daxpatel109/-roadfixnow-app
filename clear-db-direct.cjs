const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xztnixlmoxunwnboelpr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dG5peGxtb3h1bnduYm9lbHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzIyMTgsImV4cCI6MjA5ODkwODIxOH0.0021XlPRreXwGz-GtMltxLroB-QlFmlXL5jXe2bt8y4'
);

async function clearDB() {
  const { data, error } = await supabase
    .from('repair_requests')
    .delete()
    .neq('status', 'ignore_me'); // delete everything

  if (error) console.error(error);
  else console.log("Successfully cleared all fake data!");
}

clearDB();
