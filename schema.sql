-- =============================================================
-- Space Engineers Ore & POI Registry — Supabase schema
-- Version 0.1 — matches SPEC.md
--
-- Run in the Supabase SQL editor (or via the Supabase CLI).
-- Order matters: enums → tables → functions → triggers → RLS.
-- =============================================================

-- ----- Extensions -------------------------------------------
create extension if not exists "pgcrypto";   -- for gen_random_uuid()

-- ----- Enums ------------------------------------------------
create type location_type as enum ('ore', 'poi');
create type user_role     as enum ('member', 'admin');

-- =============================================================
-- Tables
-- =============================================================

-- ----- profiles ---------------------------------------------
-- One row per auth user. Created automatically on signup
-- (see handle_new_user trigger below).
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text unique not null,
  role       user_role not null default 'member',
  banned     boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----- servers ----------------------------------------------
-- A world/server. Coordinates are only comparable within one server.
create table public.servers (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  created_at  timestamptz not null default now()
);

-- ----- locations --------------------------------------------
create table public.locations (
  id           uuid primary key default gen_random_uuid(),
  server_id    uuid not null references public.servers (id) on delete cascade,
  name         text not null,
  type         location_type not null,
  resource     text,                       -- e.g. Ice, Iron (ores only)
  x            double precision not null,
  y            double precision not null,
  z            double precision not null,
  gps_raw      text not null,              -- original string for copy-paste
  color        text,                       -- e.g. #FF75C9F1
  planet       text,                       -- Earthlike, Mars, Moon, ...
  description  text,
  image_url    text,
  submitted_by uuid not null references public.profiles (id) on delete cascade,
  is_hidden    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index locations_server_idx   on public.locations (server_id);
create index locations_type_idx     on public.locations (type);
create index locations_resource_idx on public.locations (resource);
create index locations_planet_idx   on public.locations (planet);
create index locations_coords_idx   on public.locations (server_id, x, y, z);

-- ----- ratings ----------------------------------------------
create table public.ratings (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  score       int not null check (score between 1 and 5),
  created_at  timestamptz not null default now(),
  unique (location_id, user_id)            -- one rating per user per location
);

create index ratings_location_idx on public.ratings (location_id);

-- =============================================================
-- Helper functions
-- =============================================================

-- Is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Keep updated_at fresh on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create a profile row automatically when a new auth user signs up.
-- Username falls back to the email local-part if none is supplied.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

-- Only admins may change a profile's role or banned flag. This stops a member
-- from updating their own row to escalate to admin or un-ban themselves.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role
      or new.banned is distinct from old.banned)
     and not public.is_admin() then
    raise exception 'Only admins can change role or banned';
  end if;
  return new;
end;
$$;

-- Only admins may change is_hidden. Members editing their own row keep it as-is.
create or replace function public.guard_is_hidden()
returns trigger
language plpgsql
as $$
begin
  if new.is_hidden is distinct from old.is_hidden and not public.is_admin() then
    raise exception 'Only admins can change is_hidden';
  end if;
  return new;
end;
$$;

-- Near-duplicate search: locations on the same server within `radius`
-- in-game units (default 5000 = 5 km), ordered by distance.
-- Used by the submission form before saving.
create or replace function public.nearby_locations(
  p_server_id uuid,
  p_x double precision,
  p_y double precision,
  p_z double precision,
  p_radius double precision default 5000
)
returns table (
  id       uuid,
  name     text,
  type     location_type,
  resource text,
  x        double precision,
  y        double precision,
  z        double precision,
  distance double precision
)
language sql
stable
as $$
  select
    l.id, l.name, l.type, l.resource, l.x, l.y, l.z,
    sqrt(power(l.x - p_x, 2) + power(l.y - p_y, 2) + power(l.z - p_z, 2)) as distance
  from public.locations l
  where l.server_id = p_server_id
    and not l.is_hidden
    and sqrt(power(l.x - p_x, 2) + power(l.y - p_y, 2) + power(l.z - p_z, 2)) < p_radius
  order by distance asc;
$$;

-- Per-location rating summary (average + count).
create or replace view public.location_ratings as
  select
    location_id,
    round(avg(score)::numeric, 1) as avg_score,
    count(*)                      as rating_count
  from public.ratings
  group by location_id;

-- =============================================================
-- Triggers
-- =============================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_guard_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

create trigger locations_guard_is_hidden
  before update on public.locations
  for each row execute function public.guard_is_hidden();

-- =============================================================
-- Row Level Security
-- =============================================================

alter table public.profiles  enable row level security;
alter table public.servers   enable row level security;
alter table public.locations enable row level security;
alter table public.ratings   enable row level security;

-- ----- profiles ---------------------------------------------
create policy "Profiles are readable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

-- ----- servers ----------------------------------------------
create policy "Servers are readable by everyone"
  on public.servers for select
  using (true);

create policy "Admins manage servers"
  on public.servers for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----- locations --------------------------------------------
-- Visible to everyone unless hidden; owners and admins see their hidden rows too.
create policy "Locations are readable unless hidden"
  on public.locations for select
  using (not is_hidden or submitted_by = auth.uid() or public.is_admin());

-- Members submit on their own behalf (and only if not banned).
create policy "Members can submit locations"
  on public.locations for insert
  with check (
    submitted_by = auth.uid()
    and not exists (
      select 1 from public.profiles
      where id = auth.uid() and banned = true
    )
  );

-- Owners can edit their own; admins can edit anything.
-- (guard_is_hidden trigger still blocks members from flipping is_hidden.)
create policy "Owners or admins can update locations"
  on public.locations for update
  using (submitted_by = auth.uid() or public.is_admin())
  with check (submitted_by = auth.uid() or public.is_admin());

create policy "Owners or admins can delete locations"
  on public.locations for delete
  using (submitted_by = auth.uid() or public.is_admin());

-- ----- ratings ----------------------------------------------
create policy "Ratings are readable by everyone"
  on public.ratings for select
  using (true);

create policy "Users can add their own rating"
  on public.ratings for insert
  with check (user_id = auth.uid());

create policy "Users can update their own rating"
  on public.ratings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own rating"
  on public.ratings for delete
  using (user_id = auth.uid());

-- =============================================================
-- Notes
-- =============================================================
-- * Turnstile is enforced in the Next.js API layer (verify the token
--   server-side before insert/login/search), not in SQL.
-- * To make the first admin, run after they sign up:
--     update public.profiles set role = 'admin' where username = 'YOUR_NAME';
-- * The submission form should call nearby_locations(...) and show any
--   matches to the user before inserting the new row.
