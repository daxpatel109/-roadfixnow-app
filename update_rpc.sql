-- Drop the old functions first to avoid signature conflicts
DROP FUNCTION IF EXISTS public.find_nearest_mechanics(double precision, double precision, double precision);
DROP FUNCTION IF EXISTS public.find_nearest_mechanics(double precision, double precision, double precision, integer);
DROP FUNCTION IF EXISTS public.find_nearest_mechanics(double precision, double precision, double precision, uuid[]);

-- Create the new updated function
CREATE OR REPLACE FUNCTION public.find_nearest_mechanics(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision,
  p_exclude_ids uuid[] DEFAULT '{}'::uuid[]
)
RETURNS TABLE (
  mechanic_id uuid,
  distance_km double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.mechanic_id,
    -- Haversine formula calculation for distance in kilometers
    (6371 * acos(
      cos(radians(p_lat)) * cos(radians(ml.latitude)) * 
      cos(radians(ml.longitude) - radians(p_lng)) + 
      sin(radians(p_lat)) * sin(radians(ml.latitude))
    )) AS distance_km
  FROM mechanic_locations ml
  JOIN users u ON u.id = ml.mechanic_id
  WHERE 
    ml.availability_status = 'online'
    AND u.status = 'active'
    -- Only mechanics that have sent a GPS ping in the last 10 minutes
    AND extract(epoch from (now() - ml.last_location_update)) < 600
    -- Exclude mechanics we have already pinged in this loop
    AND (array_length(p_exclude_ids, 1) IS NULL OR ml.mechanic_id != ALL(p_exclude_ids))
    -- Haversine distance filter
    AND (6371 * acos(
      cos(radians(p_lat)) * cos(radians(ml.latitude)) * 
      cos(radians(ml.longitude) - radians(p_lng)) + 
      sin(radians(p_lat)) * sin(radians(ml.latitude))
    )) <= p_radius_km
  ORDER BY distance_km ASC;
END;
$$;
