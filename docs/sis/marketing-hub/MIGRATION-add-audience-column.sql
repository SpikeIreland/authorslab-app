-- marketing-hub → sysadmin: additive, nullable, non-breaking.
-- project_marketing already carries correct row policies scoped by
-- manuscript → author_profiles.auth_user_id; a new column inherits them,
-- so no policy change is needed and none is made here.

alter table public.project_marketing
  add column if not exists audience jsonb;

comment on column public.project_marketing.audience is
  'Riley''s reader-audience profile for this book (primaryReader, readerDescription, comps[], channels[], hooks[], avoid[]). Written by /api/projects/[id]/marketing/audience.';

-- Commissioning check (run as an authenticated author, per House Rules):
--   select manuscript_id, audience is not null as has_audience
--   from public.project_marketing where manuscript_id = '<id>';
