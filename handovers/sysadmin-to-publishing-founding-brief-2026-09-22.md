# SysAdmin → Publishing — Founding brief (author-side hub, not the trade portal)

**From:** `sysadmin` (via Paul) · **To:** `publishing` · **cc:** `publisher` (disambiguation critical) · **Date:** 2026-09-22 · **Status:** chartering. Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1` (V1.1), `PUSH-CEREMONY-V1` first.

## Why this chat exists — and this is the single most important sentence in the brief

**Publishing (this chat) is the AUTHOR-side launch-prep surface. Publisher's Journey (`publisher` chat) is the TRADE-side portal for real publishers.** Two different audiences, two different chats, two different route trees. Confusing them is easy — Paul flagged the risk explicitly — so the disambiguation is where this brief starts.

## What you own — the author's Publishing hub

The station on the author's journey between Design (cover done) and Marketing (launch begins) where the *logistical* work of preparing a book to ship happens: metadata, ISBN, distribution setup, launch checklist, format handoff. The author uses this surface to get their finished book ready for the world.

- **`/projects/[id]/publishing`** — the project-scoped Publishing tab
- **`/publishing-hub`** — the legacy standalone publishing surface (mirrors the legacy `/author-studio` pattern — real work happens here today; migration into the project shell may come as a follow-on)
- **Launch checklist, metadata, distribution wiring** (Amazon KDP, IngramSpark, other platforms) — the operational scaffolding for putting a book in the world
- **Format Manuscript flow** (n8n `6.1 Format Manuscript`, migrated task #71)
- The **Taylor persona** on the publishing surface — currently shared with Design (see §4)

## What you do NOT own

- **`/publisher/*` routes and the Publisher's Journey portal** — that's `publisher` chat. That's a *trade* audience view (Neil Blair, agents, editors, imprints) — the surface a publisher opens to review, approve, comment on the author's manuscript, and eventually commission work through AuthorsLab. It sits path-scoped on the same domain but serves opposite ends of the industry.
- **Design tab and cover work** (`/projects/[id]/design`) — that's `design` chat. They hand off the completed cover to you; you build the launch checklist around it.
- **Marketing assets and launch campaigns** (`/projects/[id]/marketing`) — that's `marketing` chat. You hand off the launched book to them; they run the post-launch campaign.
- **Billing and identity plumbing** — that's `identity-billing`. Publishing may need to check subscription entitlement (e.g., is this user on a plan that includes distribution?) but you don't implement the gating.

## The Publishing / Publisher line — worked example

Same imaginary book. Same imaginary moment. Two audiences, two surfaces, both real:

- **The author** (`/projects/[id]/publishing`, your surface) sees: *"Cover approved. Metadata: ISBN required — start ISBN application? Choose distribution channels: KDP (selected), IngramSpark, Draft2Digital. Launch date: pick a Tuesday. Preview back-matter."*
- **Their publisher** (`/publisher/[projectId]`, `publisher`'s surface) sees: *"Book approved for launch. Rights confirmed — publisher owns print + premium, author retains audio + Substack. Distribution: publisher's usual print run, IngramSpark for POD. Launch coordination lead: <acquisitions editor name>. Approve cover, sign off."*

Same book. Two takes on "publishing", one for each side of the industry.

## Persona ambiguity — flag for resolution

`Taylor` is currently the persona used for BOTH Design and Publishing (the "Taylor D&P" naming from earlier task work). The tab strip has them as two separate stations; the phase-4 derivations collapse them under Taylor. Whether Taylor stays as one persona covering both, or splits into two, is your design decision to make with `design` and `ux`.

## Context you inherit

- **`src/app/projects/[id]/publishing/page.tsx`** — 21KB, from 2026-07-29. Current project-scoped publishing tab.
- **`src/app/publishing-hub/page.tsx`** — 37KB legacy standalone hub, from 2026-07-30. Real work still happens here (mirrors the legacy `/author-studio` pattern). Migration into the project shell is a future concern — not demo-blocking.
- **n8n workflow `6.1 Format Manuscript`** — migrated 2026-09 (task #71). Handles final format conversion.
- **TDP-DT-01** (tasks #75-77) — Design tab + storage bucket + n8n changes; some of that touches your side.
- **`docs/sis/taylor-dp/`** — historical Taylor Design & Publishing handovers.
- **The DP-STRIPE-01 plan gating** — Publishing is one of the surfaces potentially gated on subscription tier. Coordinate with `identity-billing` on how the gate reads (per their state-of-the-estate §D, the current gate logic in `src/lib/accessControl.ts` is broken and slated for deletion).

## Blair demo (Wednesday 2026-09-24) — your part

Carl will show the Author's view of the Publishing hub on Book 1 (Veil, the launched book) and/or Book 2 (Signal, in-edit — Publishing surface probably in a "waiting for editing to complete" state). Timing budget: 60-90 seconds.

**What you need to check this week:**
1. Does `/projects/[id]/publishing` render cleanly for both a launched book (Veil) and a mid-edit book (Signal)? What does the empty / not-yet-ready state look like?
2. Any P0 errors when a real user clicks in? (See the recent I&B state-of-the-estate note that `accessControl.ts` is currently rejecting non-admin, non-beta users on this route — a paying subscriber would hit "insufficient access". Coordinate with `identity-billing` on whether this affects Carl's demo.)
3. Coordinate with `publisher` chat on the on-camera line between Publishing (author-side) and Publisher (trade-side) — Carl may narrate the transition, and having both surfaces feel like *the two sides of the same story* is a small polish that reads well.

Not asking you to build new work for Wednesday.

## Post-demo priorities (initial view; re-triage after audit)

1. **Publishing tab audit** — current state of both `/publishing-hub` and `/projects/[id]/publishing`, migration path from legacy hub into the project shell.
2. **Author/publisher two-sided launch coordination** — when a publisher-relationship exists on a book, how does the author's Publishing hub differ? (Publisher owns distribution → author doesn't see distribution options; publisher owns launch date → author's checklist adapts.) Design with `publisher`.
3. **Persona ambiguity resolution** (§4) with `design` and `ux`.
4. **Format-and-distribution wiring** — the operational depth here is real (ISBNs, KDP APIs, IngramSpark, D2D). Post-demo scoping.
5. **Publishing surface plan gating** — after `identity-billing` fixes the gating layer, wire your surface to the entitlement endpoint they end up producing.

## Coordination protocol

Per Courier Convention V1.1:
- Your inbox: `handovers/inbox/publishing/`.
- **When in doubt about a courier addressee, check the name:** anything about *publishers viewing a book* → `publisher`. Anything about *authors preparing to publish* → you.
- Primary coordination partners: `design` (cover handoff, persona ambiguity), `publisher` (two-sided launch coordination — a courier from `publisher` about "cover approval" is a shared concern, not just theirs), `marketing` (launch handoff), `identity-billing` (plan gating), `ux` (workspace layout, tab strip, language).
- Decisions for Paul → pointer to `handovers/inbox/paul/`.
- Push Ceremony V1 binds when you stage code.

## First-turn instructions

1. Read the three founding docs and this brief.
2. Save memory: your slug (`publishing`), your inbox path, your charter (the AUTHOR-side launch-prep hub, distinct from `publisher`'s trade portal).
3. Read the audit files in §6 — the current surface, the legacy hub, the Taylor D&P historical handovers.
4. File an audit + demo-readiness courier back to `sysadmin` (cc `publisher` for the disambiguation record, cc `design` for the persona ambiguity discussion): current state of your two surfaces, demo-week concerns, and your position on Taylor-shared-vs-split.
5. Delete this pointer when the audit courier is filed.

Welcome aboard.

— `sysadmin`
