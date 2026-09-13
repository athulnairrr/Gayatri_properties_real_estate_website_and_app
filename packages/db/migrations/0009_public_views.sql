-- Public-safe view: whitelisted columns only (spec §41). This is the sole read surface
-- the public website is allowed to query against `properties`.
create view public_properties as
select
  id,
  property_code,
  transaction_type,
  property_type,
  status,
  title,
  description,
  price,
  address,
  locality,
  city,
  state,
  postal_code,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  parking,
  area_sqft,
  created_at
from properties
where status = 'AVAILABLE';

grant select on public_properties to anon, authenticated;

-- Radius search: filtering happens in Postgres via PostGIS, never by shipping the whole
-- table to the browser (spec §8/§30). Distance returned in km for display/sorting.
create or replace function properties_within_radius(
  p_lng double precision,
  p_lat double precision,
  p_radius_km double precision,
  p_transaction_type transaction_type default null,
  p_property_type property_type default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_bedrooms int default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  property_code text,
  transaction_type transaction_type,
  property_type property_type,
  status property_status,
  title text,
  price numeric,
  locality text,
  city text,
  latitude double precision,
  longitude double precision,
  bedrooms int,
  bathrooms int,
  area_sqft numeric,
  distance_km double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id, p.property_code, p.transaction_type, p.property_type, p.status, p.title, p.price,
    p.locality, p.city, p.latitude, p.longitude, p.bedrooms, p.bathrooms, p.area_sqft,
    round((ST_Distance(p.geog, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000.0)::numeric, 2)::float8
  from properties p
  where p.status = 'AVAILABLE'
    and ST_DWithin(p.geog, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000)
    and (p_transaction_type is null or p.transaction_type = p_transaction_type)
    and (p_property_type is null or p.property_type = p_property_type)
    and (p_min_price is null or p.price >= p_min_price)
    and (p_max_price is null or p.price <= p_max_price)
    and (p_bedrooms is null or p.bedrooms >= p_bedrooms)
  order by ST_Distance(p.geog, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
  limit p_limit offset p_offset;
$$;

revoke all on function properties_within_radius from public;
grant execute on function properties_within_radius to anon, authenticated;
