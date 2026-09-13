# Gayatri Properties — Real Estate Website & App

Monorepo for the Gayatri Properties real estate platform: a public marketing/listings
website and an internal staff dashboard, sharing one Postgres/Supabase backend.

## Structure

```
apps/website/     Public website (Next.js) — browse, search, property detail, lead capture
apps/dashboard/    Internal staff dashboard (Next.js) — leads, customers, properties, visits
packages/core/     Shared service layer + Supabase client factories used by both apps
packages/db/       SQL migrations, seed data, and migration/seed runner scripts
docs/              Architecture notes and the Stage 1-2 security audit
```

## Local setup

1. `npm install` at the repo root (installs all workspaces).
2. Copy `apps/website/.env.example` → `apps/website/.env.local` and
   `apps/dashboard/.env.example` → `apps/dashboard/.env.local`, filling in your Supabase
   project URL and anon key.
3. `npm run dev:website` / `npm run dev:dashboard` to run each app.

Database migrations/seed data live in `packages/db` — see that folder's scripts for
applying them against your own Supabase project (`DATABASE_URL` env var, using the
**session pooler** connection string, not the direct one).

See `docs/ARCHITECTURE.md` for the security/RLS model and portability notes.
