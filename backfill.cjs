const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xztnixlmoxunwnboelpr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dG5peGxtb3h1bnduYm9lbHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzIyMTgsImV4cCI6MjA5ODkwODIxOH0.0021XlPRreXwGz-GtMltxLroB-QlFmlXL5jXe2bt8y4'
);

async function backfill() {
  const { data, error } = await supabase
    .from('repair_requests')
    .update({ amount: 149 })
    .eq('status', 'completed')
    .is('amount', null); // Or we can just update all completed ones

  // Update all completed jobs just to be safe
  const { error: err2 } = await supabase
    .from('repair_requests')
    .update({ amount: 149 })
    .eq('status', 'completed');
    
  if (err2) console.error("Error backfilling:", err2);
  else console.log("Backfill complete! All old completed jobs now have an amount of ₹149.");
}

backfill();
