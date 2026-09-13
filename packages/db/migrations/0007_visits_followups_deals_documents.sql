-- Visits (spec §23)
create table visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  staff_id uuid references staff_profiles(id) on delete set null,
  scheduled_at timestamptz not null,
  status visit_status not null default 'SCHEDULED',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references staff_profiles(id),
  updated_by uuid references staff_profiles(id)
);

create trigger trg_visits_updated_at
  before update on visits
  for each row execute function set_updated_at();

create index idx_visits_scheduled_at on visits (scheduled_at);
create index idx_visits_customer on visits (customer_id);
create index idx_visits_property on visits (property_id);
create index idx_visits_status on visits (status);

-- Follow-ups (spec §24)
create table follow_ups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  next_follow_up timestamptz not null,
  notes text,
  assigned_to uuid references staff_profiles(id) on delete set null,
  status follow_up_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references staff_profiles(id),
  updated_by uuid references staff_profiles(id)
);

create trigger trg_follow_ups_updated_at
  before update on follow_ups
  for each row execute function set_updated_at();

create index idx_follow_ups_next on follow_ups (next_follow_up);
create index idx_follow_ups_assigned on follow_ups (assigned_to);
create index idx_follow_ups_status on follow_ups (status);
create index idx_follow_ups_customer on follow_ups (customer_id);

-- Deals & commission (spec §26)
create table deals (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete restrict,
  customer_id uuid not null references customers(id) on delete restrict,
  deal_value numeric(14, 2) not null check (deal_value >= 0),
  expected_commission numeric(14, 2) not null default 0 check (expected_commission >= 0),
  commission_received numeric(14, 2) not null default 0 check (commission_received >= 0),
  status deal_status not null default 'NEGOTIATION',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references staff_profiles(id),
  updated_by uuid references staff_profiles(id)
);

create trigger trg_deals_updated_at
  before update on deals
  for each row execute function set_updated_at();

create index idx_deals_property on deals (property_id);
create index idx_deals_customer on deals (customer_id);
create index idx_deals_status on deals (status);

-- Documents: storage-backed metadata only (spec §27/§28). Never store files in Postgres.
create table documents (
  id uuid primary key default gen_random_uuid(),
  entity_type document_entity_type not null,
  entity_id uuid not null,
  file_name text not null,
  file_type text not null,
  file_size_bytes bigint check (file_size_bytes >= 0),
  storage_path text not null,
  uploaded_by uuid references staff_profiles(id),
  created_at timestamptz not null default now()
);

create index idx_documents_entity on documents (entity_type, entity_id);

alter table visits enable row level security;
alter table follow_ups enable row level security;
alter table deals enable row level security;
alter table documents enable row level security;

-- All four are internal-only tables — no anon policy at all (default deny).
create policy visits_staff_all on visits
  for all to authenticated using (is_staff()) with check (is_staff());

create policy follow_ups_staff_all on follow_ups
  for all to authenticated using (is_staff()) with check (is_staff());

-- Commission fields are sensitive: STAFF can view/manage deals, but only ADMIN can delete one.
create policy deals_staff_read_write on deals
  for select to authenticated using (is_staff());

create policy deals_staff_insert on deals
  for insert to authenticated with check (is_staff());

create policy deals_staff_update on deals
  for update to authenticated using (is_staff()) with check (is_staff());

create policy deals_admin_delete on deals
  for delete to authenticated using (is_admin());

create policy documents_staff_all on documents
  for all to authenticated using (is_staff()) with check (is_staff());
