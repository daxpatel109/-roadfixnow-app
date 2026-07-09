-- 1. Add Phone column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_request_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Simplified for MVP: frontend can insert

-- 3. Create RPC for secure contact info retrieval
CREATE OR REPLACE FUNCTION get_assigned_contact_info(p_request_id UUID)
RETURNS TABLE (
  role TEXT,
  name TEXT,
  phone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id UUID;
  v_mechanic_id UUID;
  v_request_status TEXT;
BEGIN
  -- Get the request details
  SELECT customer_id, mechanic_id, status 
  INTO v_customer_id, v_mechanic_id, v_request_status
  FROM repair_requests
  WHERE id = p_request_id;

  -- Ensure the request exists and is accepted or beyond
  IF v_request_status IN ('searching', 'cancelled') THEN
    RETURN;
  END IF;

  -- If the caller is the CUSTOMER, return the MECHANIC's details
  IF auth.uid() = v_customer_id THEN
    RETURN QUERY
    SELECT u.role, u.full_name, u.phone
    FROM users u
    WHERE u.id = v_mechanic_id;
  
  -- If the caller is the MECHANIC, return the CUSTOMER's details
  ELSIF auth.uid() = v_mechanic_id THEN
    RETURN QUERY
    SELECT u.role, u.full_name, u.phone
    FROM users u
    WHERE u.id = v_customer_id;
    
  -- If the caller is an ADMIN, return both
  ELSIF EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND u.role = 'admin') THEN
    RETURN QUERY
    SELECT u.role, u.full_name, u.phone
    FROM users u
    WHERE u.id IN (v_customer_id, v_mechanic_id);
  END IF;
  
  RETURN;
END;
$$;
