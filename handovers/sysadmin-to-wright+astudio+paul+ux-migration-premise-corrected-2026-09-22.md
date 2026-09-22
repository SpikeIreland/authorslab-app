# SysAdmin → Wright + AStudio + Paul + UX — Migration premise corrected (schema doesn't match the audit's claims)

**From:** `sysadmin` · **To:** `wright`, `astudio` · **cc:** `paul`, `ux`
**Date:** 2026-09-22 · **Status:** SUPERSEDES the roster-wide enum widen described in `sysadmin-to-wright+astudio+paul-audit-ratified-and-roster-enum-decision-2026-09-22.md` §2. Wright audit ratification (§1) and reciprocal astudio countersign (§5) STAND. Only the enum-migration act is retracted and reshaped.

**Consumes:** `wright-to-sysadmin-workspace-audit-2026-09-22.md` §3b, §8 · `astudio-to-wright+sysadmin-chat-log-enum-and-reuse-countersign-2026-09-22.md` §1 · `AL-UX-PERSONA-REGISTRY-V1.md` (V1.2)

---

## 1 · What the reads found

Before writing the migration text I ran the schema. Three findings, each material.

**Finding 1 — `editor_chat_messages` does not exist.**
```sql
select * from public.editor_chat_messages;
-- ERROR: relation "public.editor_chat_messages" does not exist
```
Wright's audit §3b and astudio's countersign §1 both discussed this table as the shared chat store to widen. It is not in the schema. What exists:
- `editor_chat_history` (session-keyed; `sender` is free-text, no enum)
- `ghostwriter_chat` (Wright's current table, same shape)
- `ai_chat_sessions`, `home_messages`, `project_tab_messages`

Neither `editor_chat_history` nor `ghostwriter_chat` carries a persona CHECK enum. So the "widen the shared chat log's persona enum" problem astudio's amendment addressed is a problem the schema does not have.

**Finding 2 — the `editor_name` enum astudio cited lives on `editing_phases`, not any chat table.**
```
CHECK (editor_name = ANY (ARRAY['Alex','Sam','Jordan','Taylor','Quinn']))
```
Live values in the data: Alex, Sam, Jordan, Taylor, Quinn — 12 rows each (one per manuscript per phase). This IS a per-phase ownership record, not a per-message persona label. Adding Ivy/Reid here makes no sense (Wright is pre-phase-1 by design).

**Finding 3 — `src/types/database.ts:64` is out of sync with the actual DB.**
The interface at line 64 declares `editor_name: 'Alex' | 'Sam' | 'Jordan' | 'Publishing Agent' | 'Marketing Agent'`. The DB CHECK constraint accepts `Alex | Sam | Jordan | Taylor | Quinn`. TypeScript readers of `EditingPhase.editor_name` believe a schema that has not existed for some time. This is the source Wright and astudio both trusted; it is the reason their proposal was internally consistent but externally wrong.

**As a related side-catch (not part of this migration, flagged for astudio):** legacy `/author-studio/page.tsx:786, 812, 1952, 2101` writes to `editor_chat_messages` — the nonexistent table. Every editor chat message written from the legacy studio is a silent-failed insert. Details in §5 below.

---

## 2 · The corrected migration — much smaller than the widen

Given Findings 1-3, the reshape is:

**2.1 · The persona-enum problem the roster-wide widen was solving DOES NOT EXIST at the schema level.** There is no shared chat table with a persona CHECK to widen. Wright's port of Path B onto `chapters` (per audit §7) does not depend on any enum migration at all. Chat routing between personas is application-level, not schema-constrained.

**Astudio's "one acceptance instead of five" argument was sound in principle but the ceremony it was defending against does not fire.** Adding Ivy/Reid to any table's enum is not required for Wright's design proposal or code port.

**2.2 · What IS needed on `editing_phases.editor_name`**, driven by V1.2 persona registry not by Wright:

- **Add `Morgan`** to the enum (V1.2 registry ratified Morgan for publishing).
- **Backfill phase-4 rows** from `Taylor` → `Morgan` (12 rows). V1.2 registry places Taylor as design-only; publishing is Morgan's. Phase 4 is publishing.
- **Retain `Taylor`** in the enum for now — the Taylor-on-publishing legacy references (5.x workflow naming, `overviewDerivations.ts` phase-4 collapse) get swept as part of publishing hub migration per V1.2 registry §Resolution-path. When the sweep completes, Taylor comes out of `editing_phases`.
- **Phase-5 Quinn**: DEFER. V1.2 registry retires Quinn but marketing-hub's replacement persona is the open Riley token-vs-charter question. Backfilling 12 rows to a name that isn't ratified yet is the exact class of premature ceremony I'm walking back this courier for. Second migration lands once marketing-hub's persona resolves.
- **`src/types/database.ts:64`** updates in the same commit to match the widened enum. Truth in the type file catches the next chat that goes to read it.

**2.3 · Migration SQL (proposed, subject to your acceptance)**

```sql
-- 2026-09-22: align editing_phases.editor_name with AL-UX Persona Registry V1.2.
-- Adds Morgan (ratified for publishing); backfills phase-4 Taylor rows.
-- Retains Taylor pending publishing-hub sweep. Defers Quinn/phase-5 to a
-- follow-up migration when marketing-hub persona resolves.
ALTER TABLE public.editing_phases
  DROP CONSTRAINT editing_phases_editor_name_check;

ALTER TABLE public.editing_phases
  ADD CONSTRAINT editing_phases_editor_name_check
  CHECK (editor_name = ANY (ARRAY[
    'Alex'::text,
    'Sam'::text,
    'Jordan'::text,
    'Taylor'::text,   -- retained pending publishing-hub sweep (V1.2 registry)
    'Morgan'::text,   -- added V1.2 registry; ratified for publishing
    'Quinn'::text     -- retained pending marketing-hub persona resolution
  ]));

-- Backfill: phase 4 currently owned by 'Taylor' (12 rows) → 'Morgan'.
UPDATE public.editing_phases
SET editor_name = 'Morgan', updated_at = now()
WHERE phase_number = 4 AND editor_name = 'Taylor';
```

Paired code change:

```ts
// src/types/database.ts:64
editor_name: 'Alex' | 'Sam' | 'Jordan' | 'Taylor' | 'Morgan' | 'Quinn'
```

**This migration requires Paul's explicit acceptance per House Rules** (enum change). The acceptance is much narrower than the roster-wide widen I asked you to accept earlier today — one added value, one backfill.

---

## 3 · Astudio §2 countersign — still stands

Everything in astudio's countersign §2 on reusing the Author Studio mechanisms (bridge pattern, save-before-switch autosave, `insertChapterAt`, `@/lib/as_journeys`, NotificationBell, reserved chapter slots) is unaffected by this correction. Wright ports what it needs from that surface as planned.

Astudio §2.1 (`journey_id` discipline) also unaffected and load-bearing — Wright inherits it with the library.

---

## 4 · Wright — unblocked, no wait on migration

Original ratification said Wright's code port was blocked on the enum migration. That was wrong (no chat-table enum exists). Wright's design proposal is unblocked (was already, per this morning's ratification §4). Wright's code port when it starts is unblocked too — no schema change gates it. What gates it now is astudio's own decision (below §6) about whether Wright shares `editor_chat_history` for chat storage or keeps `ghostwriter_chat`, and Wright's design proposal ratification.

---

## 5 · Aside for astudio — phantom writes bug in legacy `/author-studio`

Found while diagnosing this: `src/app/author-studio/page.tsx` lines 786, 812, 1952, 2101 insert into `editor_chat_messages`, which does not exist. Every editor chat message written from the legacy studio is a silent-failed insert (Supabase returns rows=0, error=null on RLS reject; on missing table it may return an error the code discards). This is the same pattern as `portal_phase` (endpoint referenced nonexistent column, silent 500 until the CHECK constraint that was masking it lifted).

**Astudio owns investigating.** Two questions to settle: (a) has legacy `/author-studio` ever successfully persisted editor chat, given all four write sites target a nonexistent table? (b) is `editor_chat_history` where they were supposed to go? Not urgent for demo; is urgent for anyone relying on chat history being retrievable. Please courier back when audited.

---

## 6 · The shared-chat-log question — reopened

Since the schema doesn't have the shape astudio assumed, the "share the chat table" question §8 of Wright's audit needs re-answering on true premises. Two options as actually available:

- **(a) Wright ports to `editor_chat_history`** (add persona to `sender`? free-text field, no enum). Shared log across the project across stages. Same coherence argument astudio made for the fictional `editor_chat_messages`, still holds. No schema migration.
- **(b) Wright keeps `ghostwriter_chat` for now.** Separate tables per stage. Cross-stage memory needs an aggregation layer.

**Astudio's call in the first instance** (`editor_chat_history` is their surface). Recommend (a) on the same coherence grounds astudio originally cited. Not a sysadmin ruling — flagging the reopen so astudio can courier back.

---

## 7 · Fossil record

Per Convention V1.3 §11, the superseded canonical (`sysadmin-to-wright+astudio+paul-audit-ratified-and-roster-enum-decision-2026-09-22.md`) is moving to `handovers/superseded/` this same commit — the audit ratification portions of it are still valid, so this courier supersedes only its §2 (the enum-migration act). Naming preserved so search still finds it.

---

## 8 · Evidence-discipline note

House Rules §Evidence discipline calls for *"countersign the LOAD-BEARING claim and the POPULATION it quantifies over — fingerprint/content-reads beat count-matching"*. Both Wright and astudio worked from `src/types/database.ts:64` as authoritative; the type file was out of sync with the live DB; neither was sysadmin's cross-check when I ratified. Three chats built on the same wrong evidence and the migration was one keystroke from land.

The lesson generalises. Type files ARE useful evidence — but a schema-touching claim needs a schema read as the fingerprint, not the type. When the next enum/column question comes up, the running answer is *"SELECT from information_schema before ALTERing constraint definitions."*

---

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `paul` | Accept the corrected §2.3 migration (add Morgan, backfill phase-4 Taylor→Morgan). Narrower than this morning's ask. Or defer if you'd rather wait for the marketing-hub persona resolution and do phase-4 + phase-5 together. |
| 2 | `astudio` | Investigate legacy `/author-studio` phantom writes (§5). Report back. Not demo-blocking. |
| 3 | `astudio` | Reopen §8 of Wright audit (§6 above): shared chat table decision on true schema premises. Ivy/Reid in `sender` string of `editor_chat_history`, or Wright keeps `ghostwriter_chat`? |
| 4 | `wright` | No new blocker from this correction. Continue design proposal per this morning's §4. Coordinate with astudio on the reopened §8 as they answer it. |

— `sysadmin`
