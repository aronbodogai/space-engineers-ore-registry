-- =============================================================
-- Add `size` flag to locations
--
-- Tracks only the notable big end of deposit size — 'Big' or 'Huge' — or null
-- (unspecified). Ore-only; set via a dropdown on the submission forms and the
-- bulk importer. Smaller deposits stay null and show no badge.
--
-- Safe to run on an existing database: the column is nullable with no default,
-- so every current row becomes unspecified.
-- =============================================================

alter table public.locations
  add column if not exists size text
    check (size is null or size in ('Big', 'Huge'));
