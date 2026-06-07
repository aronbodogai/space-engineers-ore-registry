# Space Engineers Ore & POI Registry

A community website where Space Engineers players submit, search, and rate ore
deposits and points of interest by their in-game GPS coordinates.

See [`SPEC.md`](./SPEC.md) for the full product spec and [`INFRA.md`](./INFRA.md)
for infrastructure setup.

## Tech stack

- **Next.js (React)** — frontend + API routes
- **Supabase** — Postgres database, auth, storage
- **Cloudflare Turnstile** — bot protection on submission, login, and search
- **Tailwind CSS** + shadcn/ui — styling
- **Vercel** — hosting / CI-CD
- **GitHub** — source control

## Getting started (local dev)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables and fill them in:
   ```bash
   cp .env.example .env.local
   ```
   See [`INFRA.md`](./INFRA.md) for where each value comes from.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Database

The full schema lives in [`schema.sql`](./schema.sql). Run it once in the
Supabase SQL editor to create all tables, functions, views, security rules, and
the `location-photos` storage bucket. After signing up, promote your account to
admin:

```sql
update public.profiles set role = 'admin' where username = 'YOUR_NAME';
```

## Routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Home: search + recent / top locations. | Public |
| `/locations` | Searchable, filterable, sortable list. | Public |
| `/locations/[id]` | Detail: coords, copy-GPS, photo, ratings. | Public |
| `/locations/[id]/edit` | Edit a location. | Owner / Admin |
| `/submit` | Submit a location (GPS parse, near-duplicate check). | Members |
| `/login`, `/signup` | Auth (Turnstile-protected). | Public |
| `/profile` | Your submissions + account. | Members |
| `/admin`, `/admin/servers`, `/admin/users` | Moderation & management. | Admins |

## Project layout

| Path | Purpose |
|---|---|
| `app/` | Routes, pages, and Server Actions (Next.js App Router). |
| `components/` | Shared UI (nav, Turnstile widget, buttons, cards, stars). |
| `lib/` | Supabase clients, auth guards, GPS parsing, Turnstile, helpers. |
| `SPEC.md` | Product specification (features, data model, routes). |
| `schema.sql` | Supabase database schema, views, RLS, and storage setup. |
| `INFRA.md` | Infrastructure setup runbook. |
| `.env.example` | Template for required environment variables. |
