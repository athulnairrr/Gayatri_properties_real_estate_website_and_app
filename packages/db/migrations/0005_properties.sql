-- Properties (spec §19/§20). Public/internal column split is enforced via the
-- `public_properties` view in 0009_public_views.sql + RLS below, not by frontend hiding.
create table properties (
  id uuid primary key default gen_random_uuid(),
  property_code text not null unique,

  transaction_type transaction_type not null,
  property_type property_type not null,
  status property_status not null default 'AVAILABLE',

  title text not null,
  description text,

  price numeric(14, 2) not null check (price >= 0),
  negotiation_min numeric(14, 2),
  negotiation_max numeric(14, 2),

  address text,
  locality text not null,
  city text not null default 'Thane',
  state text not null default 'Maharashtra',
  postal_code text,

  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  geog geography(Point, 4326) generated always as (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) stored,

  bedrooms int check (bedrooms >= 0),
  bathrooms int check (bathrooms >= 0),
  parking int check (parking >= 0),
  area_sqft numeric(10, 2) check (area_sqft >= 0),

  -- Internal-only fields — never selected by the public view/anon role.
  owner_name text,
  owner_phone text,
  owner_email text,
  internal_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references staff_profiles(id),
  updated_by uuid references staff_profiles(id)
);

create trigger trg_properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

-- Auto-generate property_code on insert if not supplied.
create or replace function set_property_code()
returns trigger
language plpgsql
as $$
begin
  if new.property_code is null or new.property_code = '' then
    new.property_code := generate_property_code(new.city);
  end if;
  return new;
end;
$$;

create trigger trg_properties_code
  before insert on properties
  for each row execute function set_property_code();

create index idx_properties_code on properties (property_code);
create index idx_properties_transaction_type on properties (transaction_type);
create index idx_properties_property_type on properties (property_type);
create index idx_properties_status on properties (status);
create index idx_properties_city on properties (city);
create index idx_properties_locality on properties (locality);
create index idx_properties_geog on properties using gist (geog);
create index idx_properties_price on properties (price);

-- Images/videos for a property. Files live in Supabase Storage; only metadata here (spec §27/§28).
create table property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  media_type text not null check (media_type in ('IMAGE', 'VIDEO')),
  storage_path text not null,
  is_cover boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references staff_profiles(id)
);

create index idx_property_media_property on property_media (property_id);

alter table properties enable row level security;
alter table property_media enable row level security;

-- Public/anon: no direct access to `properties` at all. Public reads go through the
-- `public_properties` view (created later) which is granted to anon explicitly.
create policy properties_staff_all on properties
  for all to authenticated
  using (is_staff())
  with check (is_staff());

create policy property_media_staff_all on property_media
  for all to authenticated
  using (is_staff())
  with check (is_staff());

-- Anon may read media rows only for properties that are publicly listed (needed to render
-- gallery images on the public site); still no access to internal property columns.
create policy property_media_public_select on property_media
  for select to anon
  using (
    exists (
      select 1 from properties p
      where p.id = property_media.property_id
        and p.status = 'AVAILABLE'
    )
  );
