# Space Engineers Ore & POI Registry — Project Spec

**Version:** 0.1 (draft)
**Last updated:** 2026-06-07

---

## 1. Overview

A community website where Space Engineers players can submit, search, and rate
ore deposits and points of interest (POIs) by their in-game GPS coordinates.
Submissions are reviewed before going public, and admins manage content and users.

### Goals

- Let players find ore/POI locations quickly via search and filters.
- Let players submit new locations by pasting an in-game GPS string.
- Keep quality high through near-duplicate warnings and community ratings.
- Give admins tools to edit, hide, and remove content and manage users.
- Protect against bots and spam with Cloudflare Turnstile.

### Non-goals (for v1)

- A graphical map / 3D coordinate view. (Designed for later — see §9.)
- Real-time multiplayer or game-server integration.
- Mobile apps. (The website will be responsive, but no native apps.)

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (React)** | One codebase for pages + API; great docs; SEO-friendly server rendering so listings are findable on Google. |
| Database + Auth | **Supabase** | Postgres database, built-in user login/signup, and role-based security rules in one dashboard. Generous free tier. |
| Bot protection | **Cloudflare Turnstile** | Lightweight CAPTCHA-free challenge on submission, login, and search. Free; verified server-side. |
| Styling | **Tailwind CSS** + shadcn/ui | Fast to build clean tables and forms with guidance. |
| Image storage | **Supabase Storage** | Optional location photos, stored as URLs. |
| Hosting | **Vercel** | Push to GitHub → auto-deploy. Free for this scale; made by the Next.js team. |
| Source control | **GitHub** | Standard; integrates with Vercel and Supabase. |

This stack is chosen for a builder who codes with guidance: it minimizes
hand-written backend code while keeping a well-documented, flexible path.

---

## 3. User Roles

| Role | Can do |
|---|---|
| **Visitor** (not logged in) | Browse and search **approved** locations; view details and ratings. |
| **Member** (logged in) | Everything a visitor can, plus submit new locations (published immediately) and rate locations (one rating per location). |
| **Admin** | Everything, plus edit, hide, or delete any location, and manage users and servers. |

Roles are enforced by Supabase security rules so that, for example, only admins
can hide or delete a location, and members can only edit or delete their own
submissions.

---

## 4. Data Model

### `servers`

A location always belongs to one **world/server**. Coordinates are only
meaningful and comparable within the same world, so this scoping is required.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key, auto-generated. |
| name | text | World/server name, e.g. "Official EU #3" or "My Survival Save". Unique. |
| description | text | Optional notes (mods, seed, public/private, etc.). |
| created_at | timestamp | Auto-set on insert. |

Admins manage the list of servers; members pick one from a dropdown when
submitting. (A "request a new server" flow can be added later if needed.)

### `locations`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key, auto-generated. |
| server_id | uuid | References `servers.id`. The world this location belongs to. |
| name | text | In-game name, e.g. `ICE_9`. **Not unique** across the registry. |
| type | enum | `ore` or `poi`. |
| resource | text | For ores: e.g. Ice, Iron, Cobalt, Silicon. Null for POIs. |
| x | numeric | Parsed X coordinate. |
| y | numeric | Parsed Y coordinate. |
| z | numeric | Parsed Z coordinate. |
| gps_raw | text | Original GPS string, stored verbatim for one-click copy back into the game. |
| color | text | Marker color hex, e.g. `#FF75C9F1` (optional). |
| planet | text | Submitter-selected tag: Earthlike, Mars, Moon, Alien, Europa, Titan, Pertam, Triton, Space (optional, for filtering). |
| description | text | Free-text notes from the submitter. |
| image_url | text | Optional photo (Supabase Storage URL). |
| submitted_by | uuid | References the submitting user. |
| is_hidden | boolean | Defaults `false`. Submissions are public immediately; admins set this `true` to hide spam/abuse after the fact. |
| created_at | timestamp | Auto-set on insert. |
| updated_at | timestamp | Auto-set on edit. |

**Identity rule:** within a given server, coordinates (x/y/z) are treated as the
real identity of a location, not the name. Names may repeat. On submission, the
system flags likely duplicates by matching X/Y/Z within a small tolerance
**among locations on the same server** so reviewers can merge or reject repeats.
Coordinates are never compared across different servers.

### `ratings`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key, auto-generated. |
| location_id | uuid | References `locations.id`. |
| user_id | uuid | References the rating user. |
| score | int | 1–5. |
| created_at | timestamp | Auto-set on insert. |

**Constraint:** one rating per (location_id, user_id). A user updates their
existing rating rather than adding a second.

**Displayed score:** the average of `score` plus the count, e.g.
"4.3 ★ from 12 ratings", computed on read. A static per-location score is
deliberately avoided so the rating reflects the community, not one editor.

### `profiles`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Matches the Supabase auth user id. |
| username | text | Display name, unique. |
| role | enum | `member` or `admin`. Defaults to `member`. |
| created_at | timestamp | Auto-set. |

---

## 5. GPS Parsing

Space Engineers exports locations in this format:

```
GPS:NAME:X:Y:Z:#COLOR:
```

Example provided:

```
GPS:ICE_9:79138.9433054972:253235.787713332:-760016.753826463:#FF75C9F1:
```

Parses to:

| Field | Value |
|---|---|
| name | `ICE_9` |
| x | `79138.9433054972` |
| y | `253235.787713332` |
| z | `-760016.753826463` |
| color | `#FF75C9F1` |
| gps_raw | the full original string |

### Parsing rules

- Split on `:`. The first segment must be the literal `GPS`.
- Segment 2 = name; segments 3–5 = X, Y, Z (parsed as decimals, may be negative).
- Segment 6 = color (optional; starts with `#`).
- Always store the **original unmodified string** in `gps_raw`.
- Reject input that doesn't start with `GPS:` or lacks three numeric coordinates,
  with a clear error message on the submission form.

This lets the site both **search by coordinates** (using the parsed numbers) and
let other players **copy the exact string back into the game**.

---

## 6. Features

### 6.1 Search & Browse

- Free-text search on name and description.
- Filters: server/world, type (ore/POI), resource, planet, minimum rating.
- Sort by newest, highest rated, or name.
- All locations are visible except those an admin has hidden (`is_hidden = true`).
- Search requests are protected by Turnstile (see §6.5).

### 6.2 Submission

- Logged-in members paste a GPS string; the form auto-fills name and X/Y/Z.
- Member selects the server/world the location belongs to.
- Member adds type, resource (if ore), planet, description, and an optional photo.
- **Published immediately** — there is no review queue. The location is public as soon as it's submitted.
- **Near-duplicate warning:** before saving, the system checks for any existing
  location **on the same server within 5 km** (see distance rule below). If one or
  more are found, the member is shown the matches and asked to confirm
  ("Is this the same spot?") — but they can still proceed.
- The submission form is protected by Turnstile (see §6.5).

**Distance rule:** coordinates are in in-game meters, so 5 km = 5000 units.
Two locations are "near" if the 3D straight-line distance between them is under
5000: `sqrt((x1−x2)² + (y1−y2)² + (z1−z2)²) < 5000`, computed only among
locations sharing the same `server_id`.

### 6.3 Ratings

- Members rate locations 1–5; the average and count are shown on each listing.
- One rating per user per location (updatable).

### 6.4 Admin Management

- Hide (`is_hidden = true`), edit, or delete any location. There is no
  pre-publish review — moderation happens after the fact.
- Manage the server/world list (create, rename, remove).
- User management: view users, promote/demote between `member` and `admin`,
  and (optionally) ban a user from submitting.

### 6.5 Bot & Spam Protection (Cloudflare Turnstile)

Turnstile guards the three endpoints most exposed to bots and abuse:

- **Submission** — prevents automated spam locations.
- **Login / signup** — prevents credential-stuffing and fake-account creation.
- **Search** — prevents scraping and abusive query volume.

The widget runs on the client and issues a token; the **server verifies that
token with Cloudflare** before the action is allowed. An unverified or missing
token is rejected. Keys are stored as environment variables (site key on the
client, secret key on the server only).

---

## 7. Pages / Routes (v1)

| Route | Purpose | Access |
|---|---|---|
| `/` | Home: search bar + recent/top locations. | Public |
| `/locations` | Searchable, filterable list. | Public |
| `/locations/[id]` | Location detail: coords, copy-GPS button, description, photo, ratings. | Public |
| `/submit` | Submission form (immediate publish + near-duplicate warning). | Members |
| `/login`, `/signup` | Auth. | Public |
| `/profile` | User's own submissions and account. | Members |
| `/admin` | Content management (hide/edit/delete). | Admins |
| `/admin/users` | User management. | Admins |
| `/admin/servers` | Server/world management. | Admins |

---

## 8. Open Questions

- Should rejected submissions be visible to their submitter (with the reason), or hidden entirely?
- Do we want categories/tags beyond ore vs POI (e.g. "trading post", "wreck", "base")?
- Should members be able to request a new server/world, or is server creation admin-only? (v1 assumes admin-only.)
- Is 5 km the right near-duplicate radius, or should it differ for ores vs POIs?

---

## 9. Future Considerations (post-v1)

- **Map / coordinate view:** plot X/Y/Z visually. The data model already stores
  parsed coordinates, so this can be added without schema changes.
- **Voting/comments** on locations beyond a star rating.
- **API** for tools or Discord bots to query the registry.
- **Bulk import** of multiple GPS strings at once.
