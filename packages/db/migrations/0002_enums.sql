-- Lookup enums. Kept small and extensible (spec §20/§21/§26).

create type staff_role as enum ('ADMIN', 'STAFF');

create type transaction_type as enum ('SALE', 'RENT');

create type property_type as enum ('FLAT', 'PLOT', 'VILLA', 'COMMERCIAL');

create type property_status as enum ('AVAILABLE', 'HOLD', 'SOLD', 'RENTED');

create type person_role as enum ('BUYER', 'TENANT', 'OWNER', 'BROKER', 'BUILDER');

create type lead_status as enum ('NEW_LEAD', 'CONTACTED', 'ACTIVE', 'INACTIVE');

create type lead_source as enum (
  'WEBSITE', 'QR_CODE', 'WHATSAPP', 'PHONE', 'WALK_IN', 'REFERRAL', 'MANUAL'
);

create type visit_status as enum ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

create type follow_up_status as enum ('PENDING', 'DONE', 'RESCHEDULED', 'CANCELLED');

create type deal_status as enum ('NEGOTIATION', 'TOKEN_RECEIVED', 'AGREEMENT_DONE', 'CLOSED');

create type document_entity_type as enum ('PROPERTY', 'CUSTOMER', 'DEAL', 'VISIT');
