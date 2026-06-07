# Infrastructure Setup Runbook

Follow these phases in order. Each one ends with values you'll paste into the
next. Keep a scratch note open for the keys you collect — you'll enter them all
into Vercel at the end.

You already have **GitHub**, **Vercel**, and **Cloudflare** accounts. You still
need a **Supabase** account (free — sign up with your GitHub login).

---

## Phase 1 — GitHub repository

Run these from the project folder on your own computer (git works normally
there). If a partial `.git` folder already exists in the folder, delete it first
— it's an empty stub left over from setup:

- Windows (PowerShell): `Remove-Item -Recurse -Force .git`
- macOS/Linux: `rm -rf .git`

1. Create a new repository at <https://github.com/new>.
   - Name: `space-engineers-ore-registry`
   - Visibility: your choice (Private is fine; Vercel can still deploy it).
   - Do **not** add a README/.gitignore (we already have them).
2. Initialize and push the existing files:
   ```bash
   git init
   git add .
   git commit -m "Initial spec, schema, and config"
   git branch -M main
   git remote add origin https://github.com/YOUR_USER/space-engineers-ore-registry.git
   git push -u origin main
   ```

> Tip: you can also authorize the GitHub connector via the `/mcp` command, after
> which I can create and push the repo for you directly.

---

## Phase 2 — Supabase (database + auth)

1. Go to <https://supabase.com> and create a new project.
   - Pick a region close to your players.
   - Set a strong database password (save it).
   - Wait ~2 minutes for it to provision.
2. **Run the schema:** open the project, go to the **SQL Editor**, click
   *New query*, paste the entire contents of [`schema.sql`](./schema.sql), and
   run it. You should see it create the tables, functions, and policies.
3. **Collect the API keys:** Project Settings → **API**. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
4. **Auth settings:** Authentication → Sign In / Providers.
   - Enable **Email** (email + password) for v1.
   - Under URL Configuration, add your site URLs to the redirect allowlist
     (add `http://localhost:3000` now; add the Vercel URL after Phase 4).
5. **Storage (optional, for location photos):** Storage → create a public
   bucket named `location-images`.

---

## Phase 3 — Cloudflare Turnstile (bot protection)

1. In the Cloudflare dashboard, open **Turnstile** and add a new widget.
   - Name: `ore-registry`
   - Hostnames: add `localhost` and your Vercel domain (you can edit later).
   - Widget mode: **Managed** (recommended).
2. Copy the two keys it generates:
   - **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public, used in the browser)
   - **Secret Key** → `TURNSTILE_SECRET_KEY` (server-only secret)

The app verifies the token server-side against
`https://challenges.cloudflare.com/turnstile/v0/siteverify` before allowing a
submission, login, or search.

---

## Phase 4 — Vercel (hosting + CI/CD)

1. Go to <https://vercel.com> → **Add New… → Project**.
2. **Import** the `space-engineers-ore-registry` GitHub repo. Authorize Vercel
   to access it if prompted. Vercel auto-detects Next.js — leave build settings
   default.
3. **Environment Variables:** before deploying, add all five from your scratch
   note (see the table below). Add them to **Production**, **Preview**, and
   **Development**.
4. Click **Deploy**. Every future `git push` to `main` auto-deploys; pull
   requests get preview URLs.

> Note: the deploy will only succeed once the Next.js app exists (the
> implementation phase). You can connect the repo now and the first green deploy
> will follow as soon as app code lands.

5. After the first deploy, copy your `*.vercel.app` URL and:
   - Add it to Supabase Auth redirect URLs (Phase 2, step 4).
   - Add it to the Turnstile widget hostnames (Phase 3, step 1).

---

## Phase 5 — Custom domain (optional)

If you want a custom domain via Cloudflare:

1. In Vercel → Project → **Settings → Domains**, add your domain.
2. In Cloudflare DNS, add the record Vercel shows you (usually a CNAME, or
   A/AAAA for an apex domain).
3. Set the Cloudflare proxy to **DNS only** (grey cloud) for the Vercel record
   to avoid double-proxying, unless you intentionally want Cloudflare in front.

---

## Environment variable reference

| Variable | Source | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **Server only** |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare → Turnstile | Public |
| `TURNSTILE_SECRET_KEY` | Cloudflare → Turnstile | **Server only** |

Anything prefixed `NEXT_PUBLIC_` is bundled into the browser — never put a
secret behind that prefix. The two server-only keys must stay out of client code.

---

## Setup checklist

- [ ] GitHub repo created and pushed
- [ ] Supabase project created
- [ ] `schema.sql` run successfully
- [ ] Supabase API keys collected
- [ ] Email auth enabled + redirect URLs set
- [ ] (Optional) `location-images` storage bucket created
- [ ] Turnstile widget created + keys collected
- [ ] Vercel project imported from GitHub
- [ ] All 5 env vars added to Vercel
- [ ] First deploy green (after app scaffold)
- [ ] First admin promoted via SQL
