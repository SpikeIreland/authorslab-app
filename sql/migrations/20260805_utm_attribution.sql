-- MKT-004 Ask 3 / platform-response memo.
--
-- First-touch UTM attribution persistence.
--
-- Columns are populated at signup from the `al_utm` cookie (set by middleware
-- on the visitor's first landing with utm_* params). They are FIRST-TOUCH —
-- never overwritten after signup.
--
-- All columns nullable — organic (no-UTM) visitors leave them NULL.

ALTER TABLE public.author_profiles
  ADD COLUMN IF NOT EXISTS utm_source          text,
  ADD COLUMN IF NOT EXISTS utm_medium          text,
  ADD COLUMN IF NOT EXISTS utm_campaign        text,
  ADD COLUMN IF NOT EXISTS utm_content         text,
  ADD COLUMN IF NOT EXISTS utm_term            text,
  ADD COLUMN IF NOT EXISTS utm_first_touch_at  timestamptz;

COMMENT ON COLUMN public.author_profiles.utm_source         IS 'First-touch UTM source captured at visitor landing, propagated at signup.';
COMMENT ON COLUMN public.author_profiles.utm_medium         IS 'First-touch UTM medium captured at visitor landing, propagated at signup.';
COMMENT ON COLUMN public.author_profiles.utm_campaign       IS 'First-touch UTM campaign captured at visitor landing, propagated at signup.';
COMMENT ON COLUMN public.author_profiles.utm_content        IS 'First-touch UTM content captured at visitor landing, propagated at signup.';
COMMENT ON COLUMN public.author_profiles.utm_term           IS 'First-touch UTM term captured at visitor landing, propagated at signup.';
COMMENT ON COLUMN public.author_profiles.utm_first_touch_at IS 'ISO timestamp of visitor''s first-touch landing (from al_utm cookie).';
