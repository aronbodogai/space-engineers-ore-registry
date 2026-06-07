# Infrastructure — quick reference

Infra is set up: GitHub repo, Supabase project, Cloudflare Turnstile, and Vercel
(connected to the repo, env vars added). This is now just a reference; the focus
has moved to building the app. For product detail see [`SPEC.md`](./SPEC.md) and
[`schema.sql`](./schema.sql).

## Environment variables

| Variable | Source | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API Keys | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API Keys | Public |
| `SUPABASE_SECRET_KEY` | Supabase → Settings → API Keys | **Server only** |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare → Turnstile | Public |
| `TURNSTILE_SECRET_KEY` | Cloudflare → Turnstile | **Server only** |

Uses Supabase's new publishable/secret keys (not legacy anon/service_role).
Never put a secret behind `NEXT_PUBLIC_` or commit it. Env var changes only take
effect on the next deploy.

## Notes

- **Database:** run [`schema.sql`](./schema.sql) once in the Supabase SQL editor.
- **First admin:** after signing up, run
  `update public.profiles set role = 'admin' where username = 'YOUR_NAME';`
- **Deploys:** every `git push` to `main` auto-deploys; PRs get preview URLs.
- **Custom domain:** Vercel → Settings → Domains, then add the record in
  Cloudflare DNS (set the Vercel record to DNS-only / grey cloud).

## Remaining checklist

- [ ] `schema.sql` run in Supabase — now also creates the `locations_with_stats`
      view, the admin profile-update policy, and the `location-photos` storage
      bucket, so re-run it if you applied an earlier version.
- [ ] Turnstile widget created + keys in Vercel (for local dev, the always-pass
      test keys are documented in `.env.example`).
- [ ] Repo pushed with the app (green deploy).
- [ ] First admin promoted via SQL.
