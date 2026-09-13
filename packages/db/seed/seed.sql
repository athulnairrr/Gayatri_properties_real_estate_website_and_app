-- Dev/demo dummy data. Fictional people and numbers only (spec §32). Thane-area focus,
-- Vasant Vihar prioritized. Safe to re-run: guarded with ON CONFLICT / existence checks.

-- ---------------------------------------------------------------------------
-- Staff (2 dev accounts: 1 admin, 1 staff). Passwords are for local/dev use only.
-- ---------------------------------------------------------------------------
do $$
declare
  v_admin_id uuid;
  v_staff_id uuid;
begin
  if not exists (select 1 from auth.users where email = 'admin@thanerealty.dev') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'admin@thanerealty.dev', crypt('DevAdmin123!', gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'
    )
    returning id into v_admin_id;

    insert into staff_profiles (user_id, full_name, role, phone)
    values (v_admin_id, 'Anita Deshpande', 'ADMIN', '+919820000001');
  end if;

  if not exists (select 1 from auth.users where email = 'staff@thanerealty.dev') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'staff@thanerealty.dev', crypt('DevStaff123!', gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'
    )
    returning id into v_staff_id;

    insert into staff_profiles (user_id, full_name, role, phone)
    values (v_staff_id, 'Rohit Kadam', 'STAFF', '+919820000002');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Properties — Thane West / Vasant Vihar prioritized, plus nearby areas.
-- ---------------------------------------------------------------------------
insert into properties (
  transaction_type, property_type, status, title, description, price,
  negotiation_min, negotiation_max, address, locality, city, state, postal_code,
  latitude, longitude, bedrooms, bathrooms, parking, area_sqft,
  owner_name, owner_phone, owner_email, internal_notes
)
select * from (values
  ('SALE'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '2 BHK Apartment in Vasant Vihar', 'Spacious 2 BHK with garden view, close to Vasant Vihar club house and schools.',
   9500000::numeric, 9000000::numeric, 9500000::numeric, 'Near Vasant Vihar Complex, Pokhran Road No 1', 'Vasant Vihar', 'Thane', 'Maharashtra', '400606',
   19.2114, 72.9781, 2, 2, 1, 950::numeric,
   'Suresh Patil', '+919821110001', 'suresh.patil@example.com', 'Owner prefers cash buyers, slightly flexible on price.'),

  ('RENT'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '1 BHK for Rent near Vasant Vihar', 'Well-maintained 1 BHK, semi-furnished, ideal for small families.',
   22000::numeric, null, null, 'Vasant Vihar Society, Pokhran Road No 1', 'Vasant Vihar', 'Thane', 'Maharashtra', '400606',
   19.2120, 72.9790, 1, 1, 1, 620::numeric,
   'Meena Joshi', '+919821110002', null, 'Available from next month.'),

  ('SALE'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '3 BHK Premium Apartment, Vasant Vihar', 'Large 3 BHK with modular kitchen and two balconies, gated society with amenities.',
   16500000::numeric, 15800000::numeric, 16500000::numeric, 'Vasant Vihar Complex, Pokhran Road No 2', 'Vasant Vihar', 'Thane', 'Maharashtra', '400610',
   19.2095, 72.9805, 3, 3, 2, 1450::numeric,
   'Kunal Shah', '+919821110003', 'kunal.shah@example.com', 'Documents ready, quick closure possible.'),

  ('SALE'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '2 BHK Apartment, Thane West', 'Bright 2 BHK close to Thane station, good connectivity.',
   8800000::numeric, 8300000::numeric, 8800000::numeric, 'Near Talao Pali, Thane West', 'Thane West', 'Thane', 'Maharashtra', '400601',
   19.1972, 72.9634, 2, 2, 1, 880::numeric,
   'Deepak Rane', '+919821110004', null, null),

  ('RENT'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '2 BHK for Rent, Manpada', 'Modern 2 BHK in a well-connected society near Eternity Mall.',
   28000::numeric, null, null, 'Near Eternity Mall, Manpada', 'Manpada', 'Thane', 'Maharashtra', '400607',
   19.2010, 72.9755, 2, 2, 1, 900::numeric,
   'Priya Nair', '+919821110005', 'priya.nair@example.com', null),

  ('SALE'::transaction_type, 'VILLA'::property_type, 'AVAILABLE'::property_status,
   'Independent Villa, Ghodbunder Road', '4 BHK villa with private garden and parking for 3 cars.',
   32000000::numeric, 30000000::numeric, 32000000::numeric, 'Near Hiranandani Estate, Ghodbunder Road', 'Ghodbunder Road', 'Thane', 'Maharashtra', '400615',
   19.2465, 72.9789, 4, 4, 3, 3200::numeric,
   'Ramesh Iyer', '+919821110006', null, 'Owner relocating abroad, motivated seller.'),

  ('SALE'::transaction_type, 'FLAT'::property_type, 'HOLD'::property_status,
   '1 BHK Apartment, Majiwada', 'Compact 1 BHK near Majiwada junction, good for investment.',
   6200000::numeric, 5900000::numeric, 6200000::numeric, 'Near Majiwada Junction', 'Majiwada', 'Thane', 'Maharashtra', '400601',
   19.2038, 72.9709, 1, 1, 1, 560::numeric,
   'Sunita Kulkarni', '+919821110007', null, 'On hold pending owner documentation.'),

  ('RENT'::transaction_type, 'COMMERCIAL'::property_type, 'AVAILABLE'::property_status,
   'Office Space, Wagle Estate', 'Ready-to-move commercial office space, ideal for startups.',
   65000::numeric, null, null, 'Wagle Industrial Estate, Road No 22', 'Wagle Estate', 'Thane', 'Maharashtra', '400604',
   19.1934, 72.9636, null, 2, 4, 1800::numeric,
   'Anil Mehta', '+919821110008', 'anil.mehta@example.com', null),

  ('SALE'::transaction_type, 'PLOT'::property_type, 'AVAILABLE'::property_status,
   'Residential Plot, Kasarvadavali', 'NA plot suitable for bungalow construction, clear title.',
   12000000::numeric, 11000000::numeric, 12000000::numeric, 'Near Kasarvadavali Naka', 'Kasarvadavali', 'Thane', 'Maharashtra', '400615',
   19.2578, 72.9822, null, null, null, 2400::numeric,
   'Vishal Gupta', '+919821110009', null, null),

  ('SALE'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '2 BHK Apartment, Kolshet Road', 'Corner unit with extra ventilation, close to IT parks.',
   10200000::numeric, 9700000::numeric, 10200000::numeric, 'Near Kolshet Road IT Park', 'Kolshet', 'Thane', 'Maharashtra', '400607',
   19.2225, 72.9668, 2, 2, 1, 1000::numeric,
   'Nisha Agarwal', '+919821110010', null, null),

  ('RENT'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '3 BHK for Rent, Pokhran Road No 2', 'Fully furnished 3 BHK, walking distance to Viviana Mall.',
   45000::numeric, null, null, 'Near Viviana Mall, Pokhran Road No 2', 'Pokhran Road', 'Thane', 'Maharashtra', '400610',
   19.2079, 72.9815, 3, 3, 1, 1350::numeric,
   'Alok Bhatt', '+919821110011', 'alok.bhatt@example.com', null),

  ('SALE'::transaction_type, 'FLAT'::property_type, 'SOLD'::property_status,
   '2 BHK Apartment, Thane East', 'Recently sold — kept for records/history.',
   8100000::numeric, null, null, 'Near Thane East Station', 'Thane East', 'Thane', 'Maharashtra', '400603',
   19.1890, 72.9880, 2, 2, 1, 820::numeric,
   'Farida Sheikh', '+919821110012', null, 'Deal closed last quarter.'),

  ('SALE'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '1 BHK Apartment, Mulund', 'Cozy 1 BHK close to Mulund check naka, well connected to Thane.',
   7200000::numeric, 6900000::numeric, 7200000::numeric, 'Near Mulund Check Naka', 'Mulund', 'Mumbai', 'Maharashtra', '400080',
   19.1726, 72.9425, 1, 1, 0, 610::numeric,
   'Geeta Rao', '+919821110013', null, null),

  ('RENT'::transaction_type, 'VILLA'::property_type, 'AVAILABLE'::property_status,
   'Villa for Rent, Ghodbunder Road', 'Spacious 3 BHK villa with terrace garden, gated community.',
   75000::numeric, null, null, 'Near Kapurbawdi, Ghodbunder Road', 'Ghodbunder Road', 'Thane', 'Maharashtra', '400607',
   19.2298, 72.9758, 3, 3, 2, 2200::numeric,
   'Harish Trivedi', '+919821110014', null, null)
) as v(
  transaction_type, property_type, status, title, description, price,
  negotiation_min, negotiation_max, address, locality, city, state, postal_code,
  latitude, longitude, bedrooms, bathrooms, parking, area_sqft,
  owner_name, owner_phone, owner_email, internal_notes
)
where not exists (
  select 1 from properties p where p.title = v.title and p.locality = v.locality
);

-- ---------------------------------------------------------------------------
-- Customers / leads / visits / follow-ups / deals
-- ---------------------------------------------------------------------------
do $$
declare
  v_admin uuid;
  v_staff uuid;
  v_cust_rahul uuid;
  v_cust_priyanka uuid;
  v_cust_amit uuid;
  v_cust_owner_suresh uuid;
  v_prop_vv2bhk uuid;
  v_prop_vv1bhk_rent uuid;
  v_prop_vv3bhk uuid;
  v_prop_manpada_rent uuid;
begin
  select id into v_admin from staff_profiles where full_name = 'Anita Deshpande';
  select id into v_staff from staff_profiles where full_name = 'Rohit Kadam';

  select id into v_prop_vv2bhk from properties where title = '2 BHK Apartment in Vasant Vihar';
  select id into v_prop_vv1bhk_rent from properties where title = '1 BHK for Rent near Vasant Vihar';
  select id into v_prop_vv3bhk from properties where title = '3 BHK Premium Apartment, Vasant Vihar';
  select id into v_prop_manpada_rent from properties where title = '2 BHK for Rent, Manpada';

  -- Customers (buyers/tenants)
  if not exists (select 1 from customers where phone = '+919920001001') then
    insert into customers (full_name, phone, whatsapp, email, notes, lead_status, created_by)
    values ('Rahul Sharma', '+919920001001', '+919920001001', 'rahul.sharma@example.com',
            'Looking for a 2 BHK in Vasant Vihar, budget up to 95L.', 'NEW_LEAD', v_admin)
    returning id into v_cust_rahul;
    insert into customer_roles (customer_id, role) values (v_cust_rahul, 'BUYER');
    insert into leads (customer_id, property_id, source, landing_page, message)
    values (v_cust_rahul, v_prop_vv2bhk, 'WEBSITE', '/property/vasant-vihar-2bhk', 'Interested in this property, please call.');
  end if;

  if not exists (select 1 from customers where phone = '+919920001002') then
    insert into customers (full_name, phone, whatsapp, email, notes, lead_status, created_by)
    values ('Priyanka Kulkarni', '+919920001002', '+919920001002', null,
            'Wants a 1 BHK on rent near Vasant Vihar, moving in next month.', 'CONTACTED', v_staff)
    returning id into v_cust_priyanka;
    insert into customer_roles (customer_id, role) values (v_cust_priyanka, 'TENANT');
    insert into leads (customer_id, property_id, source, landing_page, message)
    values (v_cust_priyanka, v_prop_vv1bhk_rent, 'WEBSITE', '/property/vasant-vihar-1bhk-rent', 'Is this still available?');
  end if;

  if not exists (select 1 from customers where phone = '+919920001003') then
    insert into customers (full_name, phone, whatsapp, email, notes, lead_status, created_by)
    values ('Amit Verma', '+919920001003', '+919920001003', 'amit.verma@example.com',
            'Interested in premium 3 BHK, considering Vasant Vihar and Manpada.', 'ACTIVE', v_staff)
    returning id into v_cust_amit;
    insert into customer_roles (customer_id, role) values (v_cust_amit, 'BUYER');
    insert into leads (customer_id, property_id, source, message)
    values (v_cust_amit, v_prop_vv3bhk, 'PHONE', 'Called after seeing a QR flyer at the site.');
  end if;

  if not exists (select 1 from customers where phone = '+919821110001') then
    insert into customers (full_name, phone, whatsapp, email, notes, lead_status, created_by)
    values ('Suresh Patil', '+919821110001', null, 'suresh.patil@example.com',
            'Owner of the Vasant Vihar 2 BHK listing.', 'ACTIVE', v_admin)
    returning id into v_cust_owner_suresh;
    insert into customer_roles (customer_id, role) values (v_cust_owner_suresh, 'OWNER');
  end if;

  select id into v_cust_rahul from customers where phone = '+919920001001';
  select id into v_cust_priyanka from customers where phone = '+919920001002';
  select id into v_cust_amit from customers where phone = '+919920001003';

  -- Visits
  if v_cust_rahul is not null and v_prop_vv2bhk is not null
     and not exists (select 1 from visits where customer_id = v_cust_rahul and property_id = v_prop_vv2bhk) then
    insert into visits (customer_id, property_id, staff_id, scheduled_at, status, notes, created_by)
    values (v_cust_rahul, v_prop_vv2bhk, v_staff, now() + interval '2 days', 'SCHEDULED',
            'Confirmed by phone, will bring spouse.', v_staff);
  end if;

  if v_cust_amit is not null and v_prop_vv3bhk is not null
     and not exists (select 1 from visits where customer_id = v_cust_amit and property_id = v_prop_vv3bhk) then
    insert into visits (customer_id, property_id, staff_id, scheduled_at, status, notes, created_by)
    values (v_cust_amit, v_prop_vv3bhk, v_staff, now() - interval '3 days', 'COMPLETED',
            'Liked the property, negotiating price.', v_staff);
  end if;

  -- Follow-ups
  if v_cust_priyanka is not null
     and not exists (select 1 from follow_ups where customer_id = v_cust_priyanka) then
    insert into follow_ups (customer_id, next_follow_up, notes, assigned_to, status, created_by)
    values (v_cust_priyanka, now() + interval '1 day', 'Confirm move-in date and share agreement draft.', v_staff, 'PENDING', v_staff);
  end if;

  if v_cust_rahul is not null
     and not exists (select 1 from follow_ups where customer_id = v_cust_rahul) then
    insert into follow_ups (customer_id, next_follow_up, notes, assigned_to, status, created_by)
    values (v_cust_rahul, now() - interval '1 day', 'Follow up after site visit for feedback.', v_staff, 'PENDING', v_staff);
  end if;

  -- Deals
  if v_cust_amit is not null and v_prop_vv3bhk is not null
     and not exists (select 1 from deals where customer_id = v_cust_amit and property_id = v_prop_vv3bhk) then
    insert into deals (property_id, customer_id, deal_value, expected_commission, commission_received, status, notes, created_by)
    values (v_prop_vv3bhk, v_cust_amit, 16200000, 162000, 0, 'NEGOTIATION', 'Buyer negotiating final price.', v_staff);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- More properties (broader variety across the same Thane-area localities)
-- ---------------------------------------------------------------------------
insert into properties (
  transaction_type, property_type, status, title, description, price,
  negotiation_min, negotiation_max, address, locality, city, state, postal_code,
  latitude, longitude, bedrooms, bathrooms, parking, area_sqft,
  owner_name, owner_phone, owner_email, internal_notes
)
select * from (values
  ('SALE'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '2 BHK Apartment, Manpada', 'Well-lit 2 BHK close to schools and Eternity Mall.',
   9200000::numeric, 8800000::numeric, 9200000::numeric, 'Near Eternity Mall, Manpada', 'Manpada', 'Thane', 'Maharashtra', '400607',
   19.2015, 72.9760, 2, 2, 1, 920::numeric,
   'Arvind Joshi', '+919821110015', null, null),

  ('RENT'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '3 BHK for Rent, Kolshet Road', 'Spacious 3 BHK with modular kitchen, near IT parks.',
   50000::numeric, null, null, 'Near Kolshet Road IT Park', 'Kolshet', 'Thane', 'Maharashtra', '400607',
   19.2231, 72.9672, 3, 3, 2, 1300::numeric,
   'Reema Shah', '+919821110016', null, null),

  ('SALE'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '1 BHK Apartment, Wagle Estate', 'Affordable 1 BHK close to Wagle Industrial Estate offices.',
   5800000::numeric, 5500000::numeric, 5800000::numeric, 'Near Wagle Estate Road No 16', 'Wagle Estate', 'Thane', 'Maharashtra', '400604',
   19.1928, 72.9642, 1, 1, 0, 540::numeric,
   'Nitin Sawant', '+919821110017', null, null),

  ('SALE'::transaction_type, 'VILLA'::property_type, 'AVAILABLE'::property_status,
   'Villa, Kasarvadavali', '4 BHK villa with private garden, gated community.',
   28000000::numeric, 26500000::numeric, 28000000::numeric, 'Near Kasarvadavali Naka', 'Kasarvadavali', 'Thane', 'Maharashtra', '400615',
   19.2582, 72.9815, 4, 4, 2, 2900::numeric,
   'Pallavi Menon', '+919821110018', null, 'Gated society, maintenance staff available.'),

  ('RENT'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '1 BHK for Rent, Majiwada', 'Cozy 1 BHK near Majiwada junction, ideal for bachelors.',
   16000::numeric, null, null, 'Near Majiwada Junction', 'Majiwada', 'Thane', 'Maharashtra', '400601',
   19.2042, 72.9702, 1, 1, 0, 480::numeric,
   'Om Prakash', '+919821110019', null, null),

  ('SALE'::transaction_type, 'COMMERCIAL'::property_type, 'AVAILABLE'::property_status,
   'Shop, Thane West', 'Ground floor shop on a busy road, high footfall.',
   14500000::numeric, 13800000::numeric, 14500000::numeric, 'Near Gaondevi Maidan, Thane West', 'Thane West', 'Thane', 'Maharashtra', '400602',
   19.1965, 72.9648, null, 1, 0, 400::numeric,
   'Sanjay Bhosale', '+919821110020', null, null),

  ('SALE'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '2 BHK Apartment, Mulund West', 'Bright 2 BHK, walking distance to Mulund station.',
   9800000::numeric, 9300000::numeric, 9800000::numeric, 'Near Mulund Station West', 'Mulund', 'Mumbai', 'Maharashtra', '400080',
   19.1730, 72.9412, 2, 2, 1, 890::numeric,
   'Kavita Iyer', '+919821110021', null, null),

  ('RENT'::transaction_type, 'FLAT'::property_type, 'AVAILABLE'::property_status,
   '2 BHK for Rent, Vasant Vihar', 'Second 2 BHK rental option in the same premium complex.',
   32000::numeric, null, null, 'Vasant Vihar Complex, Pokhran Road No 1', 'Vasant Vihar', 'Thane', 'Maharashtra', '400606',
   19.2108, 72.9775, 2, 2, 1, 980::numeric,
   'Ashok Pillai', '+919821110022', null, null),

  ('SALE'::transaction_type, 'PLOT'::property_type, 'AVAILABLE'::property_status,
   'Residential Plot, Ghodbunder Road', 'Corner plot facing main road, ready for construction.',
   18000000::numeric, 17000000::numeric, 18000000::numeric, 'Near Hiranandani Estate, Ghodbunder Road', 'Ghodbunder Road', 'Thane', 'Maharashtra', '400615',
   19.2471, 72.9802, null, null, null, 3000::numeric,
   'Manoj Desai', '+919821110023', null, null),

  ('SALE'::transaction_type, 'FLAT'::property_type, 'HOLD'::property_status,
   '3 BHK Apartment, Pokhran Road', 'Premium 3 BHK, under negotiation with another buyer.',
   17500000::numeric, 16800000::numeric, 17500000::numeric, 'Near Viviana Mall, Pokhran Road No 2', 'Pokhran Road', 'Thane', 'Maharashtra', '400610',
   19.2083, 72.9820, 3, 3, 2, 1500::numeric,
   'Ritu Khanna', '+919821110024', null, 'Token received from another party, hold for now.')
) as v(
  transaction_type, property_type, status, title, description, price,
  negotiation_min, negotiation_max, address, locality, city, state, postal_code,
  latitude, longitude, bedrooms, bathrooms, parking, area_sqft,
  owner_name, owner_phone, owner_email, internal_notes
)
where not exists (
  select 1 from properties p where p.title = v.title and p.locality = v.locality
);

-- ---------------------------------------------------------------------------
-- Dummy photos for every property that doesn't have any yet (deterministic
-- placeholder images keyed off property_code, so re-running this is a no-op
-- for properties that already have media).
-- ---------------------------------------------------------------------------
insert into property_media (property_id, media_type, storage_path, is_cover, sort_order)
select p.id, 'IMAGE', 'https://picsum.photos/seed/' || p.property_code || '-' || gs || '/900/675', (gs = 1), gs
from properties p, generate_series(1, 4) as gs
where not exists (select 1 from property_media pm where pm.property_id = p.id);

-- ---------------------------------------------------------------------------
-- A few more customers/leads covering other roles (tenant, broker, builder)
-- ---------------------------------------------------------------------------
do $$
declare
  v_admin uuid;
  v_staff uuid;
  v_cust uuid;
  v_prop uuid;
begin
  select id into v_admin from staff_profiles where full_name = 'Anita Deshpande';
  select id into v_staff from staff_profiles where full_name = 'Rohit Kadam';

  if not exists (select 1 from customers where phone = '+919920001004') then
    select id into v_prop from properties where title = '2 BHK for Rent, Manpada';
    insert into customers (full_name, phone, whatsapp, email, notes, lead_status, created_by)
    values ('Sneha Pillai', '+919920001004', '+919920001004', 'sneha.pillai@example.com',
            'Looking to rent a 2 BHK near Manpada for her family.', 'NEW_LEAD', v_admin)
    returning id into v_cust;
    insert into customer_roles (customer_id, role) values (v_cust, 'TENANT');
    insert into leads (customer_id, property_id, source, landing_page, message)
    values (v_cust, v_prop, 'WEBSITE', '/property/manpada-2bhk-rent', 'Can I schedule a visit this weekend?');
  end if;

  if not exists (select 1 from customers where phone = '+919920001005') then
    insert into customers (full_name, phone, whatsapp, email, notes, lead_status, created_by)
    values ('Vikram Chodankar', '+919920001005', '+919920001005', 'vikram.broker@example.com',
            'Local broker, frequently brings buyers for Thane West and Majiwada listings.', 'ACTIVE', v_staff)
    returning id into v_cust;
    insert into customer_roles (customer_id, role) values (v_cust, 'BROKER');
  end if;

  if not exists (select 1 from customers where phone = '+919920001006') then
    insert into customers (full_name, phone, whatsapp, email, notes, lead_status, created_by)
    values ('Meera Constructions', '+919920001006', '+919920001006', 'contact@meeraconstructions.example',
            'Local builder, potential source for new plot/villa inventory in Kasarvadavali.', 'CONTACTED', v_staff)
    returning id into v_cust;
    insert into customer_roles (customer_id, role) values (v_cust, 'BUILDER');
  end if;

  if not exists (select 1 from customers where phone = '+919920001007') then
    select id into v_prop from properties where title = 'Shop, Thane West';
    insert into customers (full_name, phone, whatsapp, email, notes, lead_status, created_by)
    values ('Farhan Sheikh', '+919920001007', '+919920001007', null,
            'Interested in the Thane West shop for a retail business.', 'NEW_LEAD', v_admin)
    returning id into v_cust;
    insert into customer_roles (customer_id, role) values (v_cust, 'BUYER');
    insert into leads (customer_id, property_id, source, message)
    values (v_cust, v_prop, 'WALK_IN', 'Walked into the office asking about commercial shops.');
  end if;
end $$;
