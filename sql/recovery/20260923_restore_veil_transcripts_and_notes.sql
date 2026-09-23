-- ============================================================================
-- Restore "The Veil and the Flame" editor transcripts + editorial notes
-- onto the two demo copies.
--
-- Context: the fourth clone-completeness gap. The deep-clone carried
-- manuscripts, chapters and editing_phases but not the conversation and not
-- the notes. Carl is seeing his own post-clone poking (Aug/Sep 2026) and
-- reading it as "new notes", because the January 2026 originals never
-- travelled.
--
-- Source of truth   : 7509f8bb-4207-4bad-9b08-c0203081b6e0  carlglyons@yahoo.com
-- Targets           : c037e098-2f9c-4728-8ac3-f97fb40665fc  carl@spikeisland.tv   (demo)
--                     4d0025e6-14cc-458b-a70c-f48593aff44d  paul.lyons@authorslab.ai
--
-- Verified before writing:
--   * all three copies have 37 chapters numbered 0..36, so chapter_number
--     (which is what both tables key on — there is no chapter_id FK) is
--     portable with no remapping
--   * original notes span chapters 0..36 and are all status='flagged'
--   * original senders are 'Alex' | 'Author' | 'Jordan' | 'Sam' | 'Taylor'
--     (capital-A 'Author' is what TaylorChatView expects, so phase-4 rows
--     will render on the correct side of the conversation)
--
-- Safe to run more than once: every statement is guarded by NOT EXISTS.
-- Nothing is deleted. Post-clone rows are left exactly where they are; they
-- carry later timestamps so they sort to the end of each thread.
--
-- Run in: Supabase SQL editor, project itlkncjiifbgvmvuejgm (Author Portal)
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Editor transcripts  — expect 404 rows per target (808 total)
--    phase 1 Alex 152 · phase 2 Sam 112 · phase 3 Jordan 113 · phase 4 Taylor 27
--
--    created_at is copied verbatim so the conversation reads back in its
--    original order rather than collapsing to "now".
-- ---------------------------------------------------------------------------
INSERT INTO editor_chat_history
  (id, manuscript_id, phase_number, sender, message, chapter_number, created_at)
SELECT gen_random_uuid(), t.target, h.phase_number, h.sender, h.message,
       h.chapter_number, h.created_at
FROM editor_chat_history h
CROSS JOIN (VALUES
  ('c037e098-2f9c-4728-8ac3-f97fb40665fc'::uuid),
  ('4d0025e6-14cc-458b-a70c-f48593aff44d'::uuid)
) AS t(target)
WHERE h.manuscript_id = '7509f8bb-4207-4bad-9b08-c0203081b6e0'
  AND NOT EXISTS (
    SELECT 1 FROM editor_chat_history x
    WHERE x.manuscript_id = t.target
      AND x.phase_number  = h.phase_number
      AND x.created_at    = h.created_at
      AND x.message       = h.message
  );

-- ---------------------------------------------------------------------------
-- 2. Editorial notes  — expect 514 rows per target (1,028 total)
--    phase 1 Alex 74 · phase 2 Sam 216 · phase 3 Jordan 224
--
--    This is the table nothing in the app can rebuild: rows are written
--    exclusively by the n8n chapter-analysis workflows. Without this copy the
--    only other route is re-running analysis for all 37 chapters × 3 phases.
-- ---------------------------------------------------------------------------
INSERT INTO manuscript_issues
  (id, manuscript_id, chapter_number, phase_number, element_type, severity,
   issue_description, editor_suggestion, quoted_text, start_position,
   end_position, status, created_at, updated_at)
SELECT gen_random_uuid(), t.target, i.chapter_number, i.phase_number,
       i.element_type, i.severity, i.issue_description, i.editor_suggestion,
       i.quoted_text, i.start_position, i.end_position, i.status,
       i.created_at, i.updated_at
FROM manuscript_issues i
CROSS JOIN (VALUES
  ('c037e098-2f9c-4728-8ac3-f97fb40665fc'::uuid),
  ('4d0025e6-14cc-458b-a70c-f48593aff44d'::uuid)
) AS t(target)
WHERE i.manuscript_id = '7509f8bb-4207-4bad-9b08-c0203081b6e0'
  AND NOT EXISTS (
    SELECT 1 FROM manuscript_issues x
    WHERE x.manuscript_id    = t.target
      AND x.phase_number     = i.phase_number
      AND x.chapter_number   = i.chapter_number
      AND x.issue_description = i.issue_description
  );

COMMIT;

-- ============================================================================
-- Verification — run after COMMIT.
-- Expected: all three copies at 404 chat / 514 notes, PLUS whatever post-clone
-- rows each already had (Carl +16 chat / +17 notes, Paul +4 chat / +0 notes).
-- So: original 404/514, Carl 420/531, Paul 408/514.
-- ============================================================================
SELECT p.email,
       (SELECT count(*) FROM editor_chat_history h WHERE h.manuscript_id = m.id) AS chat_rows,
       (SELECT count(*) FROM manuscript_issues  i WHERE i.manuscript_id = m.id) AS note_rows
FROM manuscripts m
LEFT JOIN author_profiles p ON p.id = m.author_id
WHERE m.id IN ('7509f8bb-4207-4bad-9b08-c0203081b6e0',
               'c037e098-2f9c-4728-8ac3-f97fb40665fc',
               '4d0025e6-14cc-458b-a70c-f48593aff44d')
ORDER BY m.created_at;
