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

> The app code is scaffolded during the implementation phase. Once it exists:

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
Supabase SQL editor to create all tables, functions, and security rules.
After signing up, promote your account to admin:

```sql
update public.profiles set role = 'admin' where username = 'YOUR_NAME';
```

## Project files

| File | Purpose |
|---|---|
| `SPEC.md` | Product specification (features, data model, routes). |
| `schema.sql` | Supabase database schema + row-level security. |
| `INFRA.md` | Step-by-step infrastructure setup runbook. |
| `.env.example` | Template for required environment variables. |
