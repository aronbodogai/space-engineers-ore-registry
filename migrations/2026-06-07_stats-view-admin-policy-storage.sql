-- =============================================================
-- Migration — 2026-06-07
-- Brings an existing database (created from the original schema.sql) up to date
-- with the app: the browse stats view, the admin profile-update policy, and the
-- location-photos storage bucket.
--
-- Safe to run as-is on an existing database (idempotent). Paste into the
-- Supabase SQL editor and Run. Fresh installs get all of this from schema.sql
-- and do NOT need this file.
-- =============================================================

-- 1) Locations joined with server name + rating summary. The browse page filters
--    by minimum rating and sorts by rating against this view.
create or replace view public.locations_with_stats
with (security_invoker = on) as
  select
    l.*,
    s.name                      as server_name,
    coalesce(r.avg_score, 0)    as avg_score,
    coalesce(r.rating_count, 0) as rating_count
  from public.locations l
  join public.servers s             on s.id = l.server_id
  left join public.location_ratings r on r.location_id = l.id;

-- 2) Let admins update any profile (promote/demote, ban/unban). The
--    guard_profile_privileges trigger still requires is_admin() for those fields.
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- 3) Public storage bucket + policies for optional location photos.
insert into storage.buckets (id, name, public)
values ('location-photos', 'location-photos', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view location photos" on storage.objects;
create policy "Anyone can view location photos"
  on storage.objects for select
  using (bucket_id = 'location-photos');

drop policy if exists "Authenticated users can upload location photos" on storage.objects;
create policy "Authenticated users can upload location photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'location-photos');

drop policy if exists "Users can delete their own location photos" on storage.objects;
create policy "Users can delete their own location photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'location-photos' and owner = auth.uid());

-- PostgREST reloads its schema cache automatically after DDL. If the "could not
-- find table" error lingers, force it once:
notify pgrst, 'reload schema';
