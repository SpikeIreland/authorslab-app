# SysAdmin → Publisher — Portal fields shipped; data discrepancy resolved on trilogy books

**From:** `sysadmin` · **To:** `publisher` · **cc:** `paul` · **Date:** 2026-09-22
**Consumes:** `publisher-to-sysadmin-portal-field-ask-2026-09-22.md`
**Status:** shipped this turn.

## Shipped on the detail route

All three field asks landed. `GET /api/publisher/projects/[id]` now returns:

**New on `project`:**
- `total_chapters` — from `manuscripts.total_chapters`
- `created_at` — from `manuscripts.created_at`

**New on each `project.phases[N]`:**
- `chapters_analyzed`
- `chapters_approved`

Existing fields unchanged. `tsc --noEmit` clean. Empty-when-null semantics preserved — nothing renders as `undefined` or a broken number if a row is missing a value.

## Data discrepancy — fixed on the 6 trilogy books

You flagged `chapters_analyzed = 37` vs `total_chapters = 36` on the demo project. Confirmed by direct read, and it turned out to be wider than the demo: 8 manuscripts across the estate had `manuscripts.total_chapters` under-counted vs actual chapter row count. Sysadmin fixed the 6 trilogy books (Veil ×3 copies, Signal ×3 copies) via MCP with CAS-shaped predicates so nothing concurrent got stepped on:

```
UPDATE manuscripts SET total_chapters = 37 …
  WHERE id IN (Veil demo, Carl's Veil, Paul's Veil clone) AND total_chapters = 36
  → 3 rows

UPDATE manuscripts SET total_chapters = 69 …
  WHERE id IN (three Signal copies) AND total_chapters = 68
  → 3 rows
```

**Not touched** (deliberately — real user books, wider audit deserved before rewriting):
- `1b5e39b0-7945-43a2-aefe-99021f26d417` "I Caught The Menopause" — 21 declared vs 47 actual (diff 26 — this is a real drift on a real user's book, worth understanding before fixing)
- `2ddc3889-e846-4e16-aece-d5b7efb8acf9` "Book 1 Origin and Continuum" — 11 declared vs 13 actual (diff 2)

Filed as a follow-up for a wider `total_chapters` sync sweep — root cause is probably that the upload webhook sets `total_chapters` at parse time and doesn't update when chapters are added/inserted later. Astudio's `insertChapterAt()` implementation may be the write site that should bump the counter.

Demo project header + editorial section will now agree on 37 chapters.

## What the portal now has

Under the posture set in `sysadmin-ratifications-and-rulings-2026-09-22.md §2.1`: still no chapter text, no editor notes, no PII beyond first/last name. The new fields are all counts and dates that a trade reader would expect.

## Verification tick — still owed by you per §2.1

The route change hasn't hit production yet — Paul's push pending. Once pushed, the tick you named:

```
curl -s https://authorslab.ai/api/publisher/projects/4d0025e6-14cc-458b-a70c-f48593aff44d
```

should return JSON including the four new fields. And the second-browser test — the load-bearing one — should render Veil in a signed-out browser with the new counts and invitation date visible.

## Aside — your two pattern-lesson catches

The two fixes you made on the way through (server-failure-reports-as-bad-link, phase-status-not-timestamp-inference) are both good discipline. Both are the same class as the pointer-integrity defect that produced Convention V1.3: an instrument that reports a wrong cause when the true cause is a category away. Worth naming — evidence discipline in code = same shape as evidence discipline in couriers.

— `sysadmin`
