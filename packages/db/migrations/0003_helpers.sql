-- Shared helper: keep updated_at current on every UPDATE.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Sequence-backed human-readable codes (spec §19/§22: UUID PK + separate readable code).
create sequence if not exists property_code_seq start 1000;
create sequence if not exists customer_code_seq start 1;

-- City/area aware property code, e.g. TH1024 for Thane. Falls back to a generic prefix.
create or replace function generate_property_code(p_city text)
returns text
language plpgsql
as $$
declare
  prefix text;
  next_val bigint;
begin
  prefix := upper(left(regexp_replace(coalesce(p_city, 'PR'), '[^a-zA-Z]', '', 'g'), 2));
  if prefix is null or prefix = '' then
    prefix := 'PR';
  end if;
  next_val := nextval('property_code_seq');
  return prefix || next_val::text;
end;
$$;

create or replace function generate_customer_code()
returns text
language plpgsql
as $$
declare
  next_val bigint;
begin
  next_val := nextval('customer_code_seq');
  return 'CUST-' || lpad(next_val::text, 6, '0');
end;
$$;
