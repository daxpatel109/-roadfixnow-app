-- 1. Mechanic Locations Table
create table if not exists mechanic_locations (
  id uuid primary key default gen_random_uuid(),
  mechanic_id uuid references users(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  availability_status text default 'offline',
  last_location_update timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(mechanic_id)
);

-- 2. Dispatch Attempts Table
create table if not exists dispatch_attempts (
  id uuid primary key default gen_random_uuid(),
  repair_request_id uuid references repair_requests(id) on delete cascade,
  mechanic_id uuid references users(id) on delete cascade,
  distance_km numeric(10,2),
  status text default 'sent',
  sent_at timestamptz default now(),
  responded_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  unique(repair_request_id, mechanic_id)
);

-- 3. RPC: Find Nearest Mechanics
create or replace function find_nearest_mechanics(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision,
  p_limit integer
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

-- 4. RPC: Accept Dispatch Job
create or replace function accept_dispatch_job(
  p_repair_request_id uuid,
  p_mechanic_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_updated_count int;
begin
  update repair_requests
  set 
    mechanic_id = p_mechanic_id,
    mechanic_name = (select full_name from users where id = p_mechanic_id),
    status = 'accepted'
  where id = p_repair_request_id
    and mechanic_id is null
    and status in ('searching', 'dispatching');

  get diagnostics v_updated_count = row_count;

  if v_updated_count = 0 then
    return json_build_object(
      'success', false,
      'message', 'This job has already been accepted by another mechanic or was cancelled.'
    );
  end if;

  update dispatch_attempts
  set status = 'accepted', responded_at = now()
  where repair_request_id = p_repair_request_id
    and mechanic_id = p_mechanic_id;

  update dispatch_attempts
  set status = 'cancelled'
  where repair_request_id = p_repair_request_id
    and mechanic_id != p_mechanic_id
    and status = 'sent';

  update mechanic_locations
  set availability_status = 'busy', updated_at = now()
  where mechanic_id = p_mechanic_id;

  return json_build_object(
    'success', true,
    'message', 'Job accepted successfully.'
  );
end;
$$;
