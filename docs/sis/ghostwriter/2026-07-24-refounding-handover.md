# Ghostwriter Chat — Re-Founding Handover

**From:** the SIS Methodology chat (SysAdmin lineage), relayed via the Platform Developer chat as sibling station
**Authorised:** Paul
**Date:** 2026-07-24
**Read this first, then the seven governing documents in `docs/sis/` in the order noted below.**

## 1 · What's changing

You are being **re-founded, not replaced**. Your accumulated context — the existing Ghostwriter brief you were spun up with (`docs/tabs/ghostwriter/BRIEF.md`), the Eden/Ivy/Reid work in the codebase, whatever you've built or planned since — remains valuable and continues. What changes is the operating frame around your work.

AuthorsLab is now run as a **production plant** under the Spike Island Studios stochastic-industrial method. The plant has a frozen Line Charter, ten numbered client decisions (D1–D10), a typed drawing of every line, an I/O Schedule and Route Definition Pack for the demo-critical Author Studio line, and a dispatch queue with machine-verifiable exit criteria. Your line — the Ghostwriter Line — has its own I/O Schedule and RDP coming from SIS when it reaches your turn; until then, you continue the work you were on, but under the standing laws and coordination protocol below.

## 2 · Your station

You are the **Ghostwriter Line station**. You own:

- Eden onboarding (5 questions, Ivy/Reid matching, the "make this a project" moment)
- Ivy/Reid studio interior (section map, content area, chat panel)
- The `ghostwriter_sessions`, `ghostwriter_sections`, `ghostwriter_chat` tables' *use* — reads, writes, and any application-side logic that acts on them
- Ghostwriter line's n8n workflows (`edenMatch`, `ivyChat`, `reidChat`, `ghostwriterGapAnalysis`, plus any new ones your line needs — coordinate via SysAdmin per register discipline)
- The user experience of Ghostwriter as a stage in a project

You do **not** own:

- The Supabase schema itself — SysAdmin applies migrations. Request new columns/tables via Paul; do not create them yourself.
- n8n deployment — Paul deploys. You describe the workflow; deployment is his.
- The project shell chrome, tab strip, or the `src/app/projects/[id]/ghostwriter/page.tsx` placeholder — those belong to the Platform Developer chat (me). When we integrate your studio into the project shell, we coordinate on which side of the seam each change lives.
- The Author Studio line, Design/Publishing/Marketing lines, or any other line's data.
- Invariant numbers — SysAdmin allocates.

## 3 · Standing laws

These bind your work identically to how they bind mine.

- **Async by default; polls are pure reads.** Any UI-side work that infers state from the database does not write on the poll path.
- **Corpse on every path.** No silent failure. No infinite spinner. If a workflow can fail, its failure has a persisted terminal state and a user-visible honest message.
- **Every AI call gets a deterministic QC gate at the next boundary.** "Done" is a gate verdict, not a state you drift into.
- **New tables ship with RLS.** Via SysAdmin, always. Every new schema change has an owner question ("who can read this, who can write this") answered at migration time.
- **User-facing copy stays entity-neutral.** "Your project" — never "your novel", "your book", "your writing". Per D7 (entity ownership ratified — an account may be a person or an imprint).
- **Posture: "AI-assisted, not AI-generated."** In every user-facing string and system prompt. This posture makes the platform safe for the broader defensive UK publishing market; the specific September customer (Jacky Klein) is unusually AI-positive but the platform copy should not rely on that.
- **Return evidence, not claims.** When you report a piece of work done, cite file paths, line numbers, log excerpts, or test artifacts. Claims that the reader has to trust are demoted to hypotheses.

## 4 · The governing documents (read in this order)

All in `docs/sis/`:

1. `AuthorsLab-Line-Charter-V1.md` — the constitution. Frozen 2026-07-22.
2. `AuthorsLab-Client-Decisions.md` — D1–D10. Amendments to design are new numbered decisions via Paul, never silent.
3. `AuthorsLab-PFD-RevC.html` — the plant drawing. Open in a browser to see the seven production lines with typed stations.
4. `AuthorsLab-IO-Schedule-AuthorStudio-V1.md` — Author Studio line's I/O Schedule. Your line will get its own; read this one to understand the pattern (tagged I/O points, contracts, WIRED/PARTIAL/MISSING status).
5. `AuthorsLab-RDP-AuthorStudio-V1.md` — Author Studio route pack. Journey definitions, gate register, subscription map, dispatch queue. Again, read to understand the pattern.
6. `AuthorsLab-Dispatches-AS-Wave1.md` — the Platform Developer's current work queue. Read for sibling context.
7. `0-REFOUNDING-BRIEF.md` — the platform developer's re-founding brief (this document is your equivalent).

Your existing brief (`docs/tabs/ghostwriter/BRIEF.md`) is not superseded — it remains the substantive product spec for your line — but it's now framed by the pack above.

## 5 · Decisions that materially affect your line

Most of D1–D10 are Author-Studio-facing, but several bind your line directly.

- **D3 — Author approves the ghostwriter → editing transfer.** This creates an Inspection Desk at your line's boundary with the Author Studio line. It is currently unbuilt (dashed on the drawing). Machinery for that transfer approval — how the author formally hands the Ghostwriter-produced draft into Author Studio — is on the roadmap. The approval must carry both timestamp and actor (D10).
- **D5 — No agency persona.** Personal and private is a design law. Your Ivy/Reid conversations are the author's private space. No agency surveillance view exists or will exist for tier-3 buyers to peer into an author's Ghostwriter conversation.
- **D6 — Chapter approval is a loop inside each editing phase.** This is Author Studio's mechanism, but your equivalent — section-level completeness signals feeding into your D3 desk — should carry the same discipline: per-unit approvals, actor recorded, deterministic gate at exit.
- **D7 — Entity ownership ratified.** An account may be a person or an imprint. Projects belong to the entity; members hold roles. `ghostwriter_sessions` is currently keyed on `author_id`; the migration-cheap rule applies to any new schema you touch — prefer `manuscript_id` scoping where sensible, so the eventual entity model layers cleanly.
- **D9 — Sign-off default: owner decides.** For your D3 transfer approval, one member holds the approval key per project (default: the project owner). Others contribute and comment but do not sign off.
- **D10 — Approvals carry the actor.** When the D3 transfer approval machinery is built, it records both `approved_at` and `approved_by` (member id). This mirrors the pattern SysAdmin applied to `chapters.phase_{1,2,3}_approved_by` on 2026-07-24.

## 6 · Shared machinery you should know about

- **`as_journeys` table** — applied by SysAdmin on 2026-07-24. It's the Author Studio line's mechanism for scan-on-arrival and corpse-on-every-path: every webhook call gets a journey row before the call fires, workers write status transitions back, a pg_cron reaper closes anything past `timeout_at`. Currently scoped to journey types `full_analysis`, `chapter_analysis`, `editor_chat`, `phase_transition`. When your line needs the same discipline (Eden matching, Ivy/Reid response, section drafting), the journey types get **registered via SysAdmin** — do not extend silently. Coordinate through Paul.
- **`chapters.phase_{1,2,3}_approved_by`** — actor capture, applied by SysAdmin on 2026-07-24. Not directly relevant to your line today, but useful to know the pattern (DB trigger auto-fills; app writes explicitly for defence-in-depth).

## 7 · Coordination with sibling stations

You are one of several station chats. The others currently active:

- **Platform Developer chat (this document's origin)** — owns the Next.js app surfaces (project shell, tab pages, legacy `/author-studio/page.tsx`), and `src/lib/n8n-config.ts`. When you integrate the Ghostwriter studio into the project shell, we coordinate: I refactor the tab page (`src/app/projects/[id]/ghostwriter/page.tsx`) to render your studio; you refactor the studio to receive project context via props/context rather than session lookup by `author_id + status`. Neither of us silently changes the other's files.
- **SIS Methodology chat (SysAdmin lineage)** — owns the plant drawing, decision register, I/O Schedules, RDPs, invariant numbers, and Supabase schema. Anything schema-shaped goes through them.

Additional station chats will be spun up over time (Design line, Publishing line, Marketing line, Script line, and probably the Offices — QCO, UCO, LMO — as they get first-class treatment). Each has its own folder under `docs/sis/`.

## 8 · Communication protocol

**Central access point: `docs/sis/`.** Not Paul.

- Your outputs: `docs/sis/ghostwriter/YYYY-MM-DD-descriptor.md`
- My outputs (Platform Dev): `docs/sis/platform-dev/YYYY-MM-DD-descriptor.md`
- Method-level findings (any chat): `docs/sis/findings/YYYY-MM-DD-station-descriptor.md`
- Governing docs (SIS Methodology): the seven top-level files in `docs/sis/`

**Self-contained briefs.** Assume the reader (any other chat, Paul, or a future you re-entering this thread) cannot see your chat context. Every output document stands alone.

**Paul is not the courier.** He directs — sets priorities, approves decisions, arbitrates cross-chat conflicts, deploys n8n. He does not carry content between chats; each chat reads from and writes to the shared folder.

**Method-level findings get flagged explicitly.** If you discover something during your work that smells like a pattern — a failure class, a discipline that should apply elsewhere, a better way — write a short finding doc under `docs/sis/findings/` with a `FINDING:` label. The SIS Methodology chat curates the register and turns those into process improvements.

## 9 · Your first action

Verification pass, per the pattern in the Refounding Brief §5.

Walk the Ghostwriter-relevant portion of your existing brief (`docs/tabs/ghostwriter/BRIEF.md`) plus any assumptions you're holding about what's built, against the live codebase and the live database. Report:

- What has moved since your brief was written
- What claims in your brief are no longer true
- What exists in the live code that your brief doesn't mention
- What state your integration work is currently in (started / in-progress / not yet begun / blocked)

Return as `docs/sis/ghostwriter/YYYY-MM-DD-verification-delta.md`, evidence-based. Cite file paths, line numbers, migration filenames. This is deliberate: your accumulated context is being re-baselined against the machinery, not trusted from memory. The Platform Developer chat is running the same pass on its own build state today.

After that, continue whatever integration work you were on, but under the standing laws and the coordination protocol above.

## 10 · If you have questions

Direct to Paul, but preferably by dropping a short brief into `docs/sis/ghostwriter/` first — that way the question and any answer are visible to sibling chats without Paul having to relay. Anything you'd want the SIS Methodology chat or the Platform Developer chat to see, drop in the shared folder rather than describe in prose to Paul.

---

*Welcome back to the floor — you built most of the Ghostwriter line. Now we instrument it and let it talk to its neighbours through the same shared protocol as everyone else.*
