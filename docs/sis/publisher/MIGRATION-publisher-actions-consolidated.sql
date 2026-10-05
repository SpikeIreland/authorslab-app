-- publisher → sysadmin · READY TO APPLY · 2026-10-05
-- CONSOLIDATES three outstanding asks against public.publisher_actions.
--
-- Supersedes:
--   docs/sis/publisher/MIGRATION-publisher-actions-station-check.sql
--   docs/sis/publisher/MIGRATION-publisher-actions-author-response-kind.sql  (WITHDRAWN)
--
-- One file because three ALTERs on one table across three turns is three
-- chances to apply two of them, and because `astudio` has since withdrawn
-- their own table in favour of this one — so the shape is now settled rather
-- than accumulating.
--
-- ─── WHAT CHANGED SINCE THE FIRST VERSION ───────────────────────────────────
--
-- The first station CHECK I sent would have rejected EVERY ROW IN THE TABLE.
-- Its stop-if-dirty step caught that, and the rows were right while my list
-- was wrong: I had written the vocabulary from my own route code and never
-- read the column. The list below is taken from the data.
--
-- `astudio` then withdrew `notes_agreements` — "the agreement record belongs
-- in YOUR publisher_actions, not a table of mine" — because it is a
-- per-chapter, append-only act by a named person, which is what this table is
-- for. That is one fewer table and one fewer attribution model, and it is the
-- right call.

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 0 · THE GUARD. Run all three queries and STOP on any non-empty result.
-- An unexpected value is a fact to see, not a typo to coerce. This step has
-- already earned its place once.
-- ════════════════════════════════════════════════════════════════════════════

select station, count(*) from public.publisher_actions
where station not in (
  'developmental','line_editing','copy_editing','publishing','marketing',
  'cover','route','manuscript','marketing_plan','channel'
) group by station;

select kind, count(*) from public.publisher_actions
where kind not in (
  'approved','revisions_requested','note','route_confirmed','notes_agreed',
  'author_response_recorded'
) group by kind;

select count(*) as rows_total from public.publisher_actions;

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 1 · `station` gains a contract. It has none today; `kind` does.
--
-- Five editorial values are editing_phases.phase_name's own, deliberately
-- IDENTICAL so the two tables join on it rather than map between. Five are
-- publisher decisions about the book rather than the text. `marketing_plan`
-- is my former `marketing`, renamed because `marketing` already means
-- editing phase 5 and mine was the meaning with no rows.
--
-- `publishing` has confirmed in writing that this is still only a convention:
-- "a channel string written under 'route' would still be accepted by the
-- database and still read as a rights decision."
-- ════════════════════════════════════════════════════════════════════════════

alter table public.publisher_actions
  add constraint publisher_actions_station_check
  check (station in (
    'developmental','line_editing','copy_editing','publishing','marketing',
    'cover','route','manuscript','marketing_plan','channel'
  ));

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 2 · `kind` gains 'notes_agreed' — astudio's agreement terminal state.
--
-- Dropped and recreated rather than widened: a CHECK cannot be altered in
-- place, and two overlapping constraints on one column are two contracts
-- disagreeing.
--
-- AND 'author_response_recorded' IS BACK, having been withdrawn on 2 Oct.
--
-- I withdrew it that afternoon believing `design` had chosen a scoped review
-- link, which would CAPTURE the author's act and leave nothing to transcribe.
-- They have since closed the carve-out the other way: the artefact is an
-- EXPORT — a share sheet of named concepts — the author replies off-platform,
-- and the editor records the response. Their words: "editor records
-- author_response_recorded with the asset id."
--
-- So the value is needed, and the reasoning I wrote for it on 2 Oct is the
-- reasoning that survives: a transcription is honest IF AND ONLY IF the
-- record cannot be mistaken for a capture. The actor is the editor — real,
-- present, accountable, read server-side from their own membership — and the
-- row carries their statement about what somebody else said.
--
-- Without this value the only honest option does not exist, and the only
-- available one is `kind='approved'` for an author who never touched the
-- system. THE CONSTRAINT WOULD BE WHAT FORCES THE DISHONEST WRITE.
--
-- Recorded because the shape matters: I withdrew a value on an inference
-- about another lane's decision, before that lane had made it. Reading their
-- answer before committing is the only reason this file is right.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.publisher_actions
  drop constraint if exists publisher_actions_kind_check;

alter table public.publisher_actions
  add constraint publisher_actions_kind_check
  check (kind in (
    'approved','revisions_requested','note','route_confirmed','notes_agreed',
    'author_response_recorded'
  ));

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 3 · A DECISION NAMES ITS SUBJECT.
--
-- The defect this closes, found in my own code and then independently in
-- `publishing`'s the same afternoon: a verdict read FOR A STATION outlives
-- the thing it was about. A cover approved on Monday still read "approved" on
-- Friday after a new version was filed on Wednesday — the publisher shown
-- their own tick against artwork they had never seen. `publishing` had the
-- identical shape on 'handed to KDP' surviving a regenerated interior.
--
-- Both of us are carrying the subject in `body` today as a convention that
-- fails closed. These columns make it a contract.
--
--   subject_ref   what the decision is about, as the owning lane names it:
--                 a cover asset id, an interior identity, a chapter number.
--                 TEXT because the subject's type differs per station and a
--                 uuid column would force the two that are not uuids into a
--                 cast nobody reads.
--   subject_kind  which namespace subject_ref is in, so two stations cannot
--                 collide on a bare string. The vocabulary-with-a-constraint
--                 rule, applied at the moment of adding a vocabulary.
--
-- Nullable, because 'note' and 'route_confirmed' are about the book itself.
-- NOT backfilled: the two live rows predate this and inventing a subject for
-- them is the fabricated-attribution defect in a new column.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.publisher_actions
  add column if not exists subject_ref text,
  add column if not exists subject_kind text;

alter table public.publisher_actions
  add constraint publisher_actions_subject_kind_check
  check (subject_kind is null or subject_kind in (
    'cover_asset',       -- cover_assets.id
    'interior_identity', -- publishing's DOCX generated_at
    'chapter',           -- chapters.chapter_number, as text
    'manuscript'         -- the book itself
  ));

-- A subject_kind with no subject_ref is a claim with nothing behind it, and a
-- subject_ref with no namespace is a string two stations can collide on.
alter table public.publisher_actions
  add constraint publisher_actions_subject_paired_check
  check ((subject_ref is null) = (subject_kind is null));

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 4 · THE FINGERPRINT — astudio's ask, and the reason it is not optional.
--
-- 'notes_agreed' says an editor agreed THESE notes. If the notes change
-- afterwards, the agreement must stop describing them — otherwise the package
-- goes to the author carrying an agreement to text nobody agreed to. That is
-- the subject-in-the-record rule applied to a body of text rather than an id,
-- and the subject of a text is its hash.
--
-- astudio owns what is hashed and how; this column only insists that
-- something is.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.publisher_actions
  add column if not exists agreed_fingerprint text;

-- An agreement with no fingerprint cannot be checked against anything, so it
-- is not an agreement. The constraint is one-directional on purpose: other
-- kinds may carry a fingerprint if a lane finds a use, but 'notes_agreed'
-- may not omit it.
alter table public.publisher_actions
  add constraint publisher_actions_agreement_fingerprinted_check
  check (kind <> 'notes_agreed' or agreed_fingerprint is not null);

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 5 · Read it all back.
-- ════════════════════════════════════════════════════════════════════════════

select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.publisher_actions'::regclass
order by conname;

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name='publisher_actions'
order by ordinal_position;
