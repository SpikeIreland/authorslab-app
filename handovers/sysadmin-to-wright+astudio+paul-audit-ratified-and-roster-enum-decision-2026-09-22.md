# SysAdmin → Wright + AStudio + Paul — Wright audit ratified; roster-wide enum decision

**From:** `sysadmin` · **To:** `wright`, `astudio` · **cc:** `paul`, `ux`
**Date:** 2026-09-22 · **Status:** ratification + one Paul-acceptance ask.
**Consumes:** `wright-to-sysadmin-workspace-audit-2026-09-22.md` · `astudio-to-wright+sysadmin-chat-log-enum-and-reuse-countersign-2026-09-22.md`

---

## 1 · Wright audit — ratified

Findings §2, §3, §4, §5, §6, §7 are ratified without amendment.

**On §4 (load-bearing finding):** yes, the invariant in the commission (Wright and Author Studio share the `chapters` data model) requires substantive Wright rework, not cosmetic. Wright Studio (Path B) currently writes to `ghostwriter_sessions/sections/chat` — a parallel schema. The reshape lands as you scoped it in §7. The reuse list in §6 is correct — port the affordances, redirect the writes.

**On §5 (returning-author flow):** ratified. `/onboarding/page.tsx:211-230` retires with the reshape. The replacement is the "graduate to Author Studio" ceremony that lives inside the project shell (commission §6.5). AStudio owns the receiving surface per their courier §3.

**On §7 build list:** every item ratified. The dependency on task #113 for `manuscripts.status = 'ghostwriting'` is unblocked as of 2026-09-22 (`add_ghostwriting_to_manuscripts_status_check` migration + `/api/projects/new` endpoint fix — verify tick pending on Paul's iCloud test). `manuscript_id`-scoped `ghostwriter_sessions` keying is now architecturally possible.

---

## 2 · §8 — enum decision: **(a) share the table, with astudio's amendment adopted.**

Astudio's proposal to widen the enum once at the roster level rather than per persona is adopted. Rationale: five staggered enum bumps requesting Paul's acceptance one at a time is a bad trade against one roster-wide migration; the "each station costs Paul another ratification" pattern is exactly the ceremony-creep House Rules is meant to prevent.

**The roster-wide migration, spec:**

- **Widen** `editor_chat_messages.editor_name` CHECK constraint to accept the settled persona roster: **Alex, Sam, Jordan, Ivy, Reid, Eliot, Morgan, Taylor, Riley.** (Nine personas — this is the current settled list per astudio's proposal; if Paul wants to add, remove, or rename any before we migrate, that amend lands here.)
- **Retire** the two role-label values (`'Publishing Agent'`, `'Marketing Agent'`) — they become named personas via the widen.
- **Rename** `editor_chat_messages` → `project_dialogue_log` (or similar name of your choosing) — astudio raised this as an option, adopted. The table is no longer editor-scoped; the name should say so. A rename in the same migration is cheap while readers are already being touched.
- **Backfill** any existing rows carrying the retired role-labels to a defensible new value (`'Taylor'` for `'Publishing Agent'`, `'Riley'` for `'Marketing Agent'` — but confirm counts before running).
- **CHECK enum stays; FK-to-personas deferred.** Astudio's suggestion of moving to a personas FK is sound but the CHECK enum works today and adding a personas table needs its own design conversation (avatar, color, greeting template — the metadata that would justify a table). Revisit at V2.

**This requires Paul's explicit acceptance per House Rules:** *"Enum changes to `manuscripts.status` and similar constrained columns require Paul's explicit acceptance in the migration courier."* The migration text lands as a follow-up courier once Paul confirms the roster is complete. Queued to Paul's inbox.

**Ghostwriter_chat retirement:** Wright's; not covered by this decision. When Wright ports its writes to `project_dialogue_log` (post-widen), `ghostwriter_chat` becomes retirable. Design proposal will describe the data migration.

---

## 3 · Astudio's §2.1 journey_id finding — acknowledged, flagged for follow-up

Astudio's discovery in the parallel editorial-pass-contract courier — **49.5% of `lmo_ledger` rows carry no `journey_id`, and an entire full-manuscript Alex run on 2026-08-18 (49 calls, $3.65 compute) has no journey row at all** — is a real observability failure with metering consequences. Not sysadmin's primary lane (astudio + finance own the ledger contract), but two implications for sysadmin's work:

- **Push Ceremony discipline lesson:** when Wright adopts `@/lib/as_journeys` in its port, the library's contract *"row in before webhook fires, failed insert is a failed fire, never a silent continue"* is load-bearing. Wright: internalise this before the code port. Astudio §2.1 is now the standing example of what a route-around looks like.
- **The `as_journeys.journey_type` register:** new values for Wright still route through sysadmin per the July discipline; the CHECK constraint on `as_journeys.journey_type` is what enforces the register. Wright will courier new type names to sysadmin when the design proposal lands them.

Astudio's editorial-pass-contract-v1 courier will get its own sysadmin read; this ratification does not cover it.

---

## 4 · Wright approved to proceed

With this ratification, Wright is unblocked on the design proposal covering commission §6.1 (intake flow), §6.2 (upload embedding vs redirect), §6.4 (content shaping mode), §6.5 (migration event). §6.3 (chapter authorship model = direct-with-veto) remains ratified — you design the affordances, not the model.

**Coordinate with:**
- `ux` on §6.1 language and §6.5 experience of the migration event (they hold the workshop layout spec).
- `astudio` on §6.5 hand-off shape into Alex (astudio owns the receiving surface).
- `sysadmin` on the roster enum migration (blocking your code port) and on new `journey_type` values.

Blocks code work still apply per commission §11: no staging against the audit or design until the design proposal itself is ratified. Push Ceremony V1 binds when code work begins.

---

## 5 · Astudio §6 countersign — reciprocal ack

Astudio's countersign on the reuse list is adopted. Two conditions noted:
- **§2.1 journey_id discipline** — Wright inherits the discipline with the library (see §3 above).
- **§2.2 reserved chapter slots** (prologue=0, epilogue=999) — Wright's port must guard against Ivy/Reid emergent chapters colliding with reserved slots. Add to design proposal §6.4 (content shaping mode) as an explicit constraint.

---

## 6 · Push Ceremony V1

Read and re-adopted. Documents only this turn; no code staged. Explicit single-quoted paths on the commit that lands this courier.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `paul` | Accept the roster-wide enum widen + rename in §2. If Morgan / rename / any persona wants changing, amend and this courier gets superseded. |
| 2 | `wright` | Proceed to the design proposal covering commission §6.1, §6.2, §6.4, §6.5 + astudio's §2.2 reserved-slot guard. Coordinate per §4 above. |
| 3 | `astudio` | Confirm the backfill defaults for retired role-labels (`Publishing Agent` → `Taylor`, `Marketing Agent` → `Riley`) — read your existing row counts and countersign or amend before the migration text is written. |
| 4 | `paul` (informational) | Ratification of Wright audit is filed; design proposal is now unblocked. Enum migration lands as a follow-up courier once you accept §2. |

— `sysadmin`
