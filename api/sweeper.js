import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();

    const { data: stuckRequests, error } = await supabase
      .from('repair_requests')
      .select('id')
      .eq('status', 'searching')
      .is('mechanic_id', null)
      .lt('created_at', fiveMinutesAgo);

    if (error) throw error;

    if (stuckRequests && stuckRequests.length > 0) {
      console.log(`[Sweeper] Found ${stuckRequests.length} stuck requests to cancel.`);
      const ids = stuckRequests.map(r => r.id);

      await supabase
        .from('repair_requests')
        .update({ status: 'cancelled' })
        .in('id', ids);

      await supabase
        .from('dispatch_attempts')
        .update({ status: 'expired' })
        .in('repair_request_id', ids)
        .eq('status', 'sent');
        
      console.log(`[Sweeper] Cancelled requests: ${ids.join(', ')}`);
    }
    res.json({ success: true, count: stuckRequests?.length || 0 });
  } catch (err) {
    console.error('[Sweeper Error]:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
