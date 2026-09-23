-- marketing-hub → sysadmin: additive, nullable, non-breaking.
-- Third of the same accepted shape (audience, pitch, content).
-- project_marketing already carries correct row policies scoped by
-- manuscript → author_profiles.auth_user_id; a new column inherits them,
-- so no policy change is needed and none is made here.

alter table public.project_marketing
  add column if not exists content jsonb;

comment on column public.project_marketing.content is
  'Riley''s content pack for this book (social[], emails[], outreach). Written by /api/projects/[id]/marketing/content. Depends on project_marketing.audience AND .pitch.';

-- Commissioning check (run as an authenticated author, per House Rules):
--   select manuscript_id,
--          audience is not null as has_audience,
--          pitch    is not null as has_pitch,
--          content  is not null as has_content
--   from public.project_marketing where manuscript_id = '<id>';
