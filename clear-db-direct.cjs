const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xztnixlmoxunwnboelpr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dG5peGxtb3h1bnduYm9lbHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzIyMTgsImV4cCI6MjA5ODkwODIxOH0.0021XlPRreXwGz-GtMltxLroB-QlFmlXL5jXe2bt8y4'
);

async function clearDB() {
  console.log("Clearing all transactional data...");
  
  // 1. Delete all notifications
  const { error: err1 } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error("Error clearing notifications:", err1);

  // 2. Delete all repair requests (this cascades to dispatch_attempts, payments, settlements)
  const { error: err2 } = await supabase.from('repair_requests').delete().neq('status', 'ignore_me');
  if (err2) console.error("Error clearing requests:", err2);

  // 3. Reset mechanic locations
  const { error: err3 } = await supabase.from('mechanic_locations').delete().neq('availability_status', 'ignore_me');
  if (err3) console.error("Error clearing locations:", err3);

  console.log("Successfully cleared all test data! The database is now empty.");
}

clearDB();
