-- =============================================================
-- Performance indexes for the browse / search / home queries.
-- Apply once in the Supabase SQL editor. Safe to re-run (IF NOT EXISTS).
-- =============================================================

-- The default sort everywhere is newest-first over visible rows
-- (home "Recently added", browse default sort). A partial index on the
-- visible set lets Postgres satisfy the ORDER BY created_at DESC + LIMIT
-- with an index scan instead of sorting the whole table, and matches the
-- is_hidden = false filter the app always applies to listings.
create index if not exists locations_visible_created_idx
  on public.locations (created_at desc)
  where is_hidden = false;

-- Free-text search uses ILIKE '%term%' on name / description / resource.
-- A leading wildcard can't use a b-tree, so these currently force a full
-- scan. Trigram GIN indexes make substring search index-backed.
create extension if not exists pg_trgm;

create index if not exists locations_name_trgm_idx
  on public.locations using gin (name gin_trgm_ops);

create index if not exists locations_description_trgm_idx
  on public.locations using gin (description gin_trgm_ops);

create index if not exists locations_resource_trgm_idx
  on public.locations using gin (resource gin_trgm_ops);

-- Note: the existing b-tree locations_resource_idx (schema.sql) no longer
-- serves any query — the resource filter is an ILIKE, now covered by the
-- trigram index above. It's harmless to keep, but you may drop it to speed
-- up writes:
--   drop index if exists public.locations_resource_idx;
