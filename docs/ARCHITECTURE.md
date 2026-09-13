# Real Estate Platform — Architecture & Schema

Status: Stage 1–2 (foundation + database). Living document — update as later stages land.

## 1. Repo layout (npm workspaces monorepo)

```
Harshal/
  apps/
    website/        Next.js public site (App Router, TS)
    dashboard/       Next.js internal staff app (App Router, TS)
  packages/
    db/              SQL migrations, seed data, node migration runner, generated DB types
    core/            Framework-agnostic business logic + service layer (portable if Supabase is swapped)
    ui/              Shared design tokens / primitives used by both apps
  docs/
    ARCHITECTURE.md  This file
```

Two Next.js apps share `packages/core` (data access + business logic) and `packages/db` (schema/types) so
neither app talks to Postgres/Supabase directly from UI code. See §4.

## 2. Why a monorepo, why npm workspaces

- One shared service/data-access layer instead of duplicating Supabase client code in two apps.
- One shared TS types file generated from the DB schema.
- Still two independently deployable Next.js apps (different Vercel projects/domains), just co-located.

## 3. Database engine

Plain PostgreSQL (Supabase-hosted for now). PostGIS extension enabled for geographic radius search.
All schema lives as plain `.sql` migration files in `packages/db/migrations`, applied with a small
node script (`packages/db/scripts/migrate.mjs`) using the standard `pg` driver and the Postgres
connection string — **not** the Supabase CLI/API — specifically so the schema and migration process
are portable to any Postgres host later (self-hosted, RDS, etc.). Supabase-specific pieces (Auth, Storage,
RLS via `auth.uid()`) are documented explicitly in §6 as the only unavoidable coupling.

## 4. Layering (portability boundary)

```
UI (Next.js pages/components)
   ↓
packages/core  — business logic + typed service functions (createLead, listProperties, scheduleVisit, ...)
   ↓
packages/db    — data access: parameterized SQL / query builder, no framework-specific code
   ↓
PostgreSQL (Supabase-hosted today)
```

Supabase-specific SDK usage is confined to:
- `packages/core/auth` — Supabase Auth (staff login sessions) for the dashboard app only.
- `packages/core/storage` — Supabase Storage upload/signed-URL helpers for documents/images/videos.
- `packages/db/client` — a thin Postgres client wrapper (works against the Supabase Postgres connection
  string today; swapping to another Postgres host later only means changing the connection string and
  re-pointing `packages/core/auth` + `storage` to alternatives).

The public website's property/search reads go through PostgREST-style typed queries in `packages/core`,
never ad-hoc Supabase calls scattered in components.

## 5. Roles & RLS model

Two staff roles for MVP: `ADMIN`, `STAFF` (extensible enum). Staff identity = `auth.users` row (Supabase
Auth) + a `staff_profiles` table (`user_id → auth.users.id`, `role`, `full_name`, `is_active`).

RLS is enabled on every business table. Policy shape:

- **Public (anon) role**: SELECT only, only on a `public_properties` view exposing whitelisted columns
  (§7), only where `status = 'AVAILABLE'` (or actively listed). INSERT only on `leads` via a narrow
  `create_public_lead()` SQL function (SECURITY DEFINER) — the anon role never gets direct INSERT/UPDATE/
  SELECT on `customers`, `leads`, `documents`, `deals`, or any table with owner/internal/commission data.
- **Authenticated staff (`authenticated` role + `staff_profiles` row)**: full CRUD on business tables per
  role checks (`ADMIN` unrestricted; `STAFF` cannot delete deals/commission-sensitive rows or manage other
  staff — enforced in policies, kept simple for MVP).
- **service_role**: bypasses RLS — used only by trusted server-side code (e.g. the lead-creation function
  context, migrations), never shipped to any frontend bundle.

This satisfies §5/§41 of the spec: public/internal separation is enforced in Postgres, not by hiding
fields in the frontend.

## 6. Unavoidable Supabase dependencies (documented per spec §4)

| Concern | Supabase feature used | Portability note |
|---|---|---|
| Staff login/session | Supabase Auth (`auth.users`, JWT) | Swappable for any OIDC/JWT provider later; `staff_profiles` already models the app-side identity separately from `auth.users` |
| File storage (images/videos/docs) | Supabase Storage | `documents`/`property_media` tables store only `storage_path` + metadata — swappable for S3/GCS by changing the storage adapter in `packages/core/storage` |
| RLS enforcement | Postgres RLS using `auth.uid()` | Standard Postgres feature; policies reference `auth.uid()` which any Postgres+JWT-aware layer (e.g. PostgREST elsewhere, or app-level checks) can replicate |

No other business logic depends on Supabase-specific APIs. Property/lead/visit/deal logic is plain SQL.

## 7. Public vs internal field classification (spec §41)

Public (`public_properties` view / public API surface):
`property_code, title, description, transaction_type, property_type, price, bedrooms, bathrooms,
parking, area_sqft, locality, city, state, latitude, longitude, status, cover_image_url, images, created_at`

Internal-only (never in any anon-readable view):
`owner_name, owner_phone, owner_email, negotiation_min, negotiation_max, internal_notes,
customers.*, leads.* (beyond the insert path), documents.*, deals.*, commission fields, staff_profiles.*`

## 8. Core entities (see migrations for exact DDL)

`staff_profiles, properties, property_media, customers, customer_roles, leads, visits, follow_ups,
deals, documents, audit-style columns on every business table (created_at, updated_at, created_by,
updated_by)`.

`customers` and `leads` are distinct: a `lead` is a raw enquiry event (may be pre-verification, tied to a
property + source); `customers` is the deduplicated person record a lead resolves into (by phone). This
keeps §21/§37 (multi-role people, dedup-by-phone) clean without a heavyweight CRM pipeline.

## 9. Geographic search

`properties.geog GEOGRAPHY(Point, 4326)` generated/maintained from `latitude`/`longitude`, GiST-indexed.
Radius search is a SQL function `properties_within_radius(lng, lat, radius_km, filters...)` using
`ST_DWithin` — filtering happens in Postgres, the frontend never downloads the full table to compute
distance client-side (spec §8/§30).

## 10. What is intentionally deferred

Per spec §42/§43: no OTP/SMS (explicitly deferred, `phone_verified` boolean + `phone_verified_at`
timestamp reserved on `leads`/`customers` for later), no realtime subscriptions (dashboard polls/re-fetches
on demand), no edge functions (one Postgres `SECURITY DEFINER` function covers the public-lead-insert
need), no audit-log table yet (created_by/updated_by columns are the seed for one later).

## 11. Known gotcha: hand-seeding Supabase Auth users

The dev seed (`packages/db/seed/seed.sql`) creates the two dev staff logins by inserting
directly into `auth.users`/`auth.identities` rather than through the Auth API (no service-role
key is used anywhere in the seed/migration scripts). Two things are easy to miss doing this,
and both cause login to fail with a generic `500 "Database error querying schema"` from GoTrue
that gives no indication of the real cause:

1. **`auth.identities` needs a matching row per user** (provider `email`, `provider_id` = the
   user's id) — without it, password sign-in fails outright.
2. **Several `auth.users` token columns must be `''`, not `NULL`**: `confirmation_token`,
   `recovery_token`, `email_change`, `email_change_token_new`, `email_change_token_current`,
   `phone_change`, `phone_change_token`, `reauthentication_token`. GoTrue's Go code scans these
   into non-nullable strings; a `NULL` there breaks the scan for *that user specifically* (other
   logins keep working fine, which makes it easy to misdiagnose as account-specific).

Both are handled in the current seed script. If you ever hand-insert another Auth user directly
via SQL, replicate both of these — or better, create the user through the Auth Admin API
(`service_role` key, server-side only) instead, which handles this correctly by construction.
