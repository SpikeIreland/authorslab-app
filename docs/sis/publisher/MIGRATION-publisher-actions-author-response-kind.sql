-- ═══════════════════════════════════════════════════════════════════════════
-- WITHDRAWN 2026-10-02, SAME DAY, DO NOT APPLY.
--
-- `design` answered the carve-out with a SCOPED REVIEW LINK rather than a
-- transcription: the author acts through an issued link naming them, so their
-- approval is CAPTURED rather than reported, and nobody writes down what
-- somebody else said. This value existed only to make a transcription honest.
-- A vocabulary value for a thing we have decided not to do is dead
-- vocabulary, and dead vocabulary is exactly how `station` came to hold two
-- meanings in this same table.
--
-- Kept rather than deleted so the reasoning survives if transcription is ever
-- proposed again — the argument below for why kind='approved' must never be
-- written for an author who never touched the system still holds, and is now
-- enforced by design's edge rather than by a kind of mine.
-- ═══════════════════════════════════════════════════════════════════════════

-- publisher → sysadmin · READY TO APPLY · 2026-10-02
--
-- Add one value to `publisher_actions.kind`:  'author_response_recorded'
--
-- WHY. The two-worlds ruling carves out one promise made to Oliver in V0.12:
--
--     "cover concepts can be shared with authors for comment, and a record
--      shows who approved what."
--
-- `sysadmin` named two ways it can resolve and ruled that the second — an
-- editor transcribing the author's reply — recreates the defect this lane
-- already removed, where `publisher_actions` took `actor_firm` from the
-- request body and defaulted to 'Unnamed firm'.
--
-- THAT READING IS ALMOST RIGHT, AND THE DIFFERENCE IS THIS COLUMN.
--
-- The 'Unnamed firm' defect was a row whose ACTOR WAS FABRICATED: a NOT NULL
-- column satisfied with a placeholder, attributing a decision to nobody.
-- A transcription is a different object. The actor is the editor — a real
-- person, present, accountable, identified server-side from their own
-- membership. What the row carries is the editor's statement about what
-- somebody else said.
--
-- That is honest IF AND ONLY IF the record cannot be mistaken for a capture.
-- So it needs a kind of its own:
--
--     approved                    the HOUSE approved. Actor: the editor.
--     author_response_recorded    the editor RECORDS what the author said.
--                                 Actor: the editor. Subject: the asset.
--
-- Without this value the only way to record the promise is to write
-- `kind='approved'` for an author who never touched the system — which IS the
-- fabricated-decision defect, arriving because the vocabulary left no honest
-- option. The constraint is currently what would force that choice.
--
-- `coverVerdictFor()` in src/app/api/publisher/lobby/_approval.ts reads only
-- 'approved' and 'revisions_requested', so a recorded response can never be
-- read back as the house's verdict. Two negative controls in
-- scripts/verify-lobby-derive.ts hold that line, including one proving a later
-- reported comment does not override an earlier house approval.

-- 1 · What is in the column now. Run first; an unexpected value is a fact to
--     see, not a typo to coerce. (My last constraint proposal was rejected by
--     exactly this step, and the step was right.)
select kind, count(*) from public.publisher_actions group by kind order by kind;

-- 2 · Replace the CHECK. Dropped and recreated rather than widened, because
--     a CHECK cannot be altered in place and a second overlapping constraint
--     on one column is two contracts disagreeing.
alter table public.publisher_actions
  drop constraint if exists publisher_actions_kind_check;

alter table public.publisher_actions
  add constraint publisher_actions_kind_check
  check (kind in (
    'approved',
    'revisions_requested',
    'note',
    'route_confirmed',
    'author_response_recorded'
  ));

-- 3 · Read it back.
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.publisher_actions'::regclass
  and conname = 'publisher_actions_kind_check';
