-- =============================================================
-- Migration — 2026-06-08
-- Fixes the Supabase "Security Definer View" advisor finding for
-- public.location_ratings. The view was created without security_invoker, so it
-- ran with the view owner's rights and bypassed RLS on public.ratings. Flipping
-- security_invoker = on makes it enforce the querying user's RLS instead,
-- matching the sibling public.locations_with_stats view.
--
-- See: https://supabase.com/docs/guides/database/database-advisors?lint=0010_security_definer_view
--
-- Safe to run as-is on an existing database (idempotent). Paste into the
-- Supabase SQL editor and Run. Fresh installs get this from schema.sql and do
-- NOT need this file.
-- =============================================================

alter view public.location_ratings set (security_invoker = on);
