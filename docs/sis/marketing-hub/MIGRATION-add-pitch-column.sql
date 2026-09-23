-- marketing-hub → sysadmin: additive, nullable, non-breaking.
-- Same shape as the accepted audience column. project_marketing already
-- carries correct row policies scoped by manuscript → author_profiles.
-- auth_user_id; a new column inherits them, so no policy change is needed
-- and none is made here.

alter table public.project_marketing
  add column if not exists pitch jsonb;

comment on column public.project_marketing.pitch is
  'Riley''s pitch for this book (oneLiner, compLine, backCover, longPitch, spokenIntro). Written by /api/projects/[id]/marketing/pitch. Depends on project_marketing.audience.';

-- Commissioning check (run as an authenticated author, per House Rules):
--   select manuscript_id, audience is not null as has_audience,
--          pitch is not null as has_pitch
--   from public.project_marketing where manuscript_id = '<id>';
