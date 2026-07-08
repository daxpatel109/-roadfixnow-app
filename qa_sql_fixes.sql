-- 1. Updated RPC: Find Nearest Mechanics
-- Now filters out mechanics whose location is older than 10 minutes
-- Now accepts an array of excluded mechanic IDs so we don't ping the same person twice when expanding radius
create or replace function find_nearest_mechanics(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision,
  p_limit integer,
  p_exclude_ids uuid[] default '{}'
)
returns table (
  mechanic_id uuid,
  distance_km numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    ml.mechanic_id,
    (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(ml.latitude)) *
        cos(radians(ml.longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(ml.latitude))
      )
    )::numeric as distance_km
  from mechanic_locations ml
  join users u on u.id = ml.mechanic_id
  where ml.availability_status = 'online'
    and u.status = 'approved'
    and ml.last_location_update > now() - interval '10 minutes'
    and not (ml.mechanic_id = any(p_exclude_ids))
  having (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(ml.latitude)) *
        cos(radians(ml.longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(ml.latitude))
      )
  ) <= p_radius_km
  order by distance_km asc
  limit p_limit;
end;
$$;

-- 2. Basic RLS for new tables (Optional but recommended for production)
alter table mechanic_locations enable row level security;
alter table dispatch_attempts enable row level security;

-- Mechanic Locations: Anyone can read (for dispatch), only mechanics can update their own
create policy "Anyone can read mechanic locations" on mechanic_locations for select using (true);
create policy "Mechanics can update their own location" on mechanic_locations for all using (auth.uid() = mechanic_id);

-- Dispatch Attempts: Mechanics can read their own, customers can read attempts for their requests
create policy "Mechanics can read their dispatch attempts" on dispatch_attempts for select using (auth.uid() = mechanic_id);
create policy "Mechanics can update their dispatch attempts" on dispatch_attempts for update using (auth.uid() = mechanic_id);
create policy "Anyone can insert dispatch attempts (system/rpc usually handles this, but allowed for customer loop)" on dispatch_attempts for insert with check (true);
create policy "Admin can do all on dispatch attempts" on dispatch_attempts for all using (
  exists (select 1 from users where users.id = auth.uid() and users.role = 'admin')
);
