-- Customers = deduplicated business contacts (spec §21/§22). Distinct from auth.users/staff_profiles.
create table customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text not null unique,

  full_name text not null,
  phone text not null,
  whatsapp text,
  email text,
  notes text,

  lead_status lead_status not null default 'NEW_LEAD',

  -- Reserved for future SMS OTP verification (spec: NOT implemented in this MVP).
  phone_verified boolean not null default false,
  phone_verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references staff_profiles(id),
  updated_by uuid references staff_profiles(id)
);

create trigger trg_customers_updated_at
  before update on customers
  for each row execute function set_updated_at();

create or replace function set_customer_code()
returns trigger
language plpgsql
as $$
begin
  if new.customer_code is null or new.customer_code = '' then
    new.customer_code := generate_customer_code();
  end if;
  return new;
end;
$$;

create trigger trg_customers_code
  before insert on customers
  for each row execute function set_customer_code();

-- Normalized phone used for dedup lookups (strip spaces/dashes, keep leading +).
create or replace function normalize_phone(p text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(p, ''), '[^0-9+]', '', 'g');
$$;

create index idx_customers_code on customers (customer_code);
create index idx_customers_phone on customers (normalize_phone(phone));
create index idx_customers_email on customers (lower(email));
create index idx_customers_full_name on customers (lower(full_name));
create index idx_customers_lead_status on customers (lead_status);

-- A person may hold more than one role (buyer, owner, broker, ...) — spec §21.
create table customer_roles (
  customer_id uuid not null references customers(id) on delete cascade,
  role person_role not null,
  primary key (customer_id, role)
);

-- Enquiry/interaction log: one row per lead submission, always tied to the resolved customer.
-- This is what gives the internal team "why did this person become a lead" context (spec §15).
create table leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  source lead_source not null default 'WEBSITE',
  landing_page text,
  message text,
  created_at timestamptz not null default now()
);

create index idx_leads_customer on leads (customer_id);
create index idx_leads_property on leads (property_id);
create index idx_leads_created_at on leads (created_at desc);

alter table customers enable row level security;
alter table customer_roles enable row level security;
alter table leads enable row level security;

-- Anon (public website) gets NO direct table access to customers/leads. All public submissions
-- go through the SECURITY DEFINER function in 0008_public_lead_fn.sql, which is the only
-- anon-callable write path — this is the backend enforcement the spec requires (§5/§41), not
-- a frontend convention.
create policy customers_staff_all on customers
  for all to authenticated
  using (is_staff())
  with check (is_staff());

create policy customer_roles_staff_all on customer_roles
  for all to authenticated
  using (is_staff())
  with check (is_staff());

create policy leads_staff_all on leads
  for all to authenticated
  using (is_staff())
  with check (is_staff());
