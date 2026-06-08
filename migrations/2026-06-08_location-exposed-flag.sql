-- =============================================================
-- Add `exposed` flag to locations
--
-- Marks an ore deposit as surface-exposed — visible on the asteroid / surface
-- and easy to mine, so more desirable. Set by the submission forms; the bulk
-- importer auto-detects it from the GPS marker's casing (any capital letter in
-- the element token = exposed, all-lowercase = buried).
--
-- Safe to run on an existing database: the column defaults to false, so every
-- current row becomes "not exposed".
-- =============================================================

alter table public.locations
  add column if not exists exposed boolean not null default false;
