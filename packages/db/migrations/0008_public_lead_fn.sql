-- The ONLY write path available to the public (anon) role. Enforces dedup-by-phone (spec §37),
-- attaches property context (spec §15), and never returns customer/internal data to the caller.
-- Explicitly does NOT do OTP/phone verification (spec: deferred). phone_verified stays false.
create or replace function create_public_lead(
  p_full_name text,
  p_phone text,
  p_property_id uuid default null,
  p_source lead_source default 'WEBSITE',
  p_landing_page text default null,
  p_message text default null
)
returns table (lead_id uuid, customer_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_customer_code text;
  v_norm_phone text;
  v_lead_id uuid;
begin
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    raise exception 'A valid name is required';
  end if;

  v_norm_phone := normalize_phone(p_phone);
  if v_norm_phone is null or length(v_norm_phone) < 8 then
    raise exception 'A valid phone number is required';
  end if;

  -- Dedup by normalized phone.
  select id, customers.customer_code into v_customer_id, v_customer_code
  from customers
  where normalize_phone(phone) = v_norm_phone
  limit 1;

  if v_customer_id is null then
    insert into customers (full_name, phone, lead_status)
    values (trim(p_full_name), p_phone, 'NEW_LEAD')
    returning id, customers.customer_code into v_customer_id, v_customer_code;
  else
    -- Existing person: keep their record, just refresh the name if they gave a fuller one,
    -- and re-activate the pipeline without discarding staff progress (don't downgrade CONTACTED/ACTIVE).
    update customers
    set full_name = case
          when length(trim(p_full_name)) > length(full_name) then trim(p_full_name)
          else full_name
        end,
        lead_status = case when lead_status = 'INACTIVE' then 'NEW_LEAD' else lead_status end
    where id = v_customer_id;
  end if;

  insert into leads (customer_id, property_id, source, landing_page, message)
  values (v_customer_id, p_property_id, p_source, p_landing_page, p_message)
  returning id into v_lead_id;

  return query select v_lead_id, v_customer_code;
end;
$$;

-- Only anon (and authenticated, for staff-triggered manual entries later) may call this function.
-- No direct table grants are given alongside it.
revoke all on function create_public_lead from public;
grant execute on function create_public_lead to anon, authenticated;
