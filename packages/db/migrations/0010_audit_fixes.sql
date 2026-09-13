-- Fixes from the Stage 1-2 security/portability audit. See docs/AUDIT_2026-09-13.md.

-- 1) FK deletion behavior: visits and follow-ups are scheduled real-world engagements /
--    tasks, not disposable attachments. Deleting the customer or property they reference
--    must not silently wipe them out (spec §38: auditability; explicit instruction to
--    prefer archive/deactivate over destructive delete for business-history tables).
--    property_media stays ON DELETE CASCADE — those rows have no independent business
--    value once the property is gone (they're just attached image/video files).
alter table visits drop constraint visits_customer_id_fkey;
alter table visits add constraint visits_customer_id_fkey
  foreign key (customer_id) references customers(id) on delete restrict;

alter table visits drop constraint visits_property_id_fkey;
alter table visits add constraint visits_property_id_fkey
  foreign key (property_id) references properties(id) on delete restrict;

alter table follow_ups drop constraint follow_ups_customer_id_fkey;
alter table follow_ups add constraint follow_ups_customer_id_fkey
  foreign key (customer_id) references customers(id) on delete restrict;

-- leads.customer_id intentionally stays ON DELETE CASCADE: a lead is a raw enquiry-event
-- log that only has meaning attached to its customer; it carries no separate scheduled
-- real-world commitment the way a visit/follow-up does.

-- 2) Bound the public radius-search function: without limits a caller could pass an
--    enormous radius or page size and force a much larger scan/result set than the UI
--    ever needs. Clamp to sane MVP bounds; behavior for in-range inputs is unchanged.
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
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_radius_km double precision;
  v_limit int;
  v_offset int;
begin
  if p_lng is null or p_lat is null or p_lng < -180 or p_lng > 180 or p_lat < -90 or p_lat > 90 then
    raise exception 'A valid location is required';
  end if;

  v_radius_km := least(greatest(coalesce(p_radius_km, 5), 0.1), 50);   -- clamp 0.1km..50km
  v_limit := least(greatest(coalesce(p_limit, 20), 1), 50);            -- clamp 1..50 per page
  v_offset := greatest(coalesce(p_offset, 0), 0);

  return query
  select
    p.id, p.property_code, p.transaction_type, p.property_type, p.status, p.title, p.price,
    p.locality, p.city, p.latitude, p.longitude, p.bedrooms, p.bathrooms, p.area_sqft,
    round((ST_Distance(p.geog, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000.0)::numeric, 2)::float8
  from properties p
  where p.status = 'AVAILABLE'
    and ST_DWithin(p.geog, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, v_radius_km * 1000)
    and (p_transaction_type is null or p.transaction_type = p_transaction_type)
    and (p_property_type is null or p.property_type = p_property_type)
    and (p_min_price is null or p.price >= p_min_price)
    and (p_max_price is null or p.price <= p_max_price)
    and (p_bedrooms is null or p.bedrooms >= p_bedrooms)
  order by ST_Distance(p.geog, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
  limit v_limit offset v_offset;
end;
$$;

revoke all on function properties_within_radius from public;
grant execute on function properties_within_radius to anon, authenticated;
