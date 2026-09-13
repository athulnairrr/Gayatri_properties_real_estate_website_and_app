-- Internal application users. Distinct from `customers` (business contacts/leads) — spec §22.
-- One row per Supabase Auth user who is staff.
create table staff_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  role staff_role not null default 'STAFF',
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_staff_profiles_updated_at
  before update on staff_profiles
  for each row execute function set_updated_at();

-- Helper used throughout RLS policies: does the current JWT belong to an active staff member,
-- and with which role? SECURITY DEFINER + stable so it's cheap to call from policies.
create or replace function current_staff_role()
returns staff_role
language sql
stable
security definer
set search_path = public
as $$
  select role from staff_profiles
  where user_id = auth.uid() and is_active = true
  limit 1;
$$;

create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff_profiles where user_id = auth.uid() and is_active = true
  );
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(current_staff_role() = 'ADMIN', false);
$$;

alter table staff_profiles enable row level security;

-- Staff can see the staff directory (needed for assigning visits/follow-ups); only admins manage it.
create policy staff_profiles_select on staff_profiles
  for select to authenticated
  using (is_staff());

create policy staff_profiles_admin_write on staff_profiles
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- A staff member may update their own basic profile fields (not role/is_active).
create policy staff_profiles_self_update on staff_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Guard: RLS with check above can't express "unless it's your own row, don't touch role/is_active".
-- A non-admin editing their own row must not change role or is_active.
create or replace function guard_staff_profile_self_update()
returns trigger
language plpgsql
as $$
begin
  if not is_admin() and new.user_id = auth.uid() then
    if new.role is distinct from old.role or new.is_active is distinct from old.is_active then
      raise exception 'Only an admin can change role or active status';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_guard_staff_profile_self_update
  before update on staff_profiles
  for each row execute function guard_staff_profile_self_update();
