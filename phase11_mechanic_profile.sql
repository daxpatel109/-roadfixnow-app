-- Phase 11: Add Shop Name for Mechanics
ALTER TABLE users ADD COLUMN IF NOT EXISTS shop_name TEXT;

-- Enable Realtime for critical tables so the dashboard updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE dispatch_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE repair_requests;
