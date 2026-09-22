# SysAdmin → Marketing Hub — Founding brief (author-book marketing)

**From:** `sysadmin` (via Paul) · **To:** `marketing-hub` · **Date:** 2026-09-22 · **Status:** chartering. Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1` (V1.2), `PUSH-CEREMONY-V1` first.

*This brief supersedes an earlier draft filed under `sysadmin-to-marketing-founding-brief-2026-09-22.md` that conflated two disciplines (product marketing + author-book marketing). Under Convention V1.2 the split is: `marketing` = product marketing of AuthorsLab; `marketing-hub` (this chat) = helping authors market their books.*

## Why this chat exists

The end of the author's journey is a launch, and every launch is marketing work — but this is the *author's* marketing of *their book*, not AuthorsLab's marketing of itself. Two different disciplines (see the Marketing / Marketing-Hub disambiguation in Convention V1.2 §slug-registry). Riley is the persona.

## What you own

- **`/projects/[id]/marketing`** — the project-scoped Marketing tab (author's launch view for their book)
- **`/marketing-hub`** — the legacy standalone marketing hub (mirrors the legacy `/publishing-hub` and `/author-studio` pattern — real work happens here today; migration into the project shell may come as a follow-on)
- **Riley persona** (renamed from Kai 2026-09-05; historical Eden → Riley on the Wright side, then Riley reassigned to Marketing)
- **Author-book marketing tools** — back-cover copy, comps research for the author's book, launch checklist marketing sections, ARC program tooling, launch social copy templates, KDP promo scheduling, Amazon A+ content, Goodreads setup
- **Post-launch campaign design** for authors' books — positioning, audience, promo pushes, review outreach

## What you do NOT own

- **AuthorsLab's product marketing** — that's `marketing` chat. `/pricing`, `/faq`, `/how-it-works`, `/free-analysis`, ad campaigns, funnel, blog SEO, MKT-004 through MKT-010. All theirs.
- **Publishing hub** (`/projects/[id]/publishing`, `/publishing-hub`) — that's `publishing` chat. They own the pre-launch logistical scaffolding (metadata, ISBN, distribution). You get the book *after* they've readied it for shelves.
- **Publisher's Journey** (`/publisher/*`) — that's `publisher` chat. The trade-side portal has its own audience.
- **Cover design and cover-derived assets creation** — that's `design`. You may CONSUME cover-derived marketing assets (crops, animations, social variants) but you don't produce the source cover.

## The Marketing / Marketing-Hub line — worked example

Same imaginary author launching *The Signal and the Shadow*:

- **`marketing` (product marketing)** is thinking: *"How do we get MORE Carls to sign up to AuthorsLab? What does the `/pricing` page say about the Author tier? Is the free-analysis funnel converting? What's the ad copy on Meta about writing your own novel?"*
- **`marketing-hub` (this chat)** is thinking: *"Carl's book launches in three weeks. What's the back-cover copy? Which Goodreads lists should he target? What's the Substack announcement post? When does he pitch the podcast circuit? Amazon A+ content — three panels or five?"*

Same word, two audiences, two disciplines.

## Context you inherit

- **`src/app/projects/[id]/marketing/page.tsx`** — 18KB, from 2026-09-05. Current project-scoped marketing tab. Riley is the persona.
- **`src/app/marketing-hub/page.tsx`** — 27KB legacy standalone, from March 2026. Very old — heaviest cleanup / migration debt in the marketing estate. Post-demo priority.

**NOT your inheritance** (recorded here so you don't accidentally claim it):
- MKT-004 through MKT-010 — all product marketing, all `marketing`'s.
- The DP-STRIPE-01 plan-gating check on marketing-hub — that's cross-cutting (I&B fixes, `publishing` may care, `marketing-hub` inherits whatever emerges).

## Blair demo (Wednesday 2026-09-24) — your part

Carl will show the Author's view of the Marketing hub — probably Book 1 (Veil, post-launch — Riley planning promo) or Book 2 (Signal, pre-launch — Riley setting up positioning). Timing: 60-90 seconds.

**What you need to check this week:**
1. Does `/projects/[id]/marketing` render cleanly for both Book 1 (launched) and Book 2 (pre-launch)? What does Riley's chat greeting look like in each state?
2. Any P0 errors when a real user clicks in? (`marketing-hub/page.tsx:128` gates on `role === 'admin'` — non-admins may hit a gate. Coordinate with `identity-billing` if this affects the demo.)
3. If Carl narrates anything about marketing HIS BOOK on-camera (as opposed to AuthorsLab's marketing), that's your line — make sure Riley's greeting/prompts read as author-focused, not product-focused.

## Post-demo priorities (initial view; re-triage after audit)

1. **Legacy `/marketing-hub` audit** — March 2026 file. Decide: refresh in place, migrate to project shell, or retire.
2. **Riley chat depth** — what can Riley actually DO for an author preparing a launch? Currently mostly conversational; post-demo work probably means real tooling (Amazon A+ preview, back-cover generator, comps lookup for the author's genre, launch calendar).
3. **Marketing surface plan gating** — after `identity-billing` fixes the gating layer, wire your surfaces to the entitlement endpoint they produce.
4. **Publisher-relationship marketing** — when a book has a publisher (i.e., not self-publishing), the publisher may own some marketing. What does Riley do differently? Coordinate with `publisher`.

## Coordination protocol

Per Courier Convention V1.2:
- Your inbox: `handovers/inbox/marketing-hub/`.
- **When in doubt about a courier addressee:** anything about *AuthorsLab's product marketing, ads, pricing pages, funnel* → `marketing`. Anything about *authors marketing their books* → you.
- Primary coordination partners: `publishing` (launch handoff — book arrives at Marketing after Publishing finishes), `publisher` (any book with a publisher relationship may split marketing responsibility), `design` (cover-derived assets), `marketing` (any cross-cutting comps or genre research that both disciplines might use), `identity-billing` (plan gating), `ux` (workspace layout).
- Decisions for Paul → pointer to `handovers/inbox/paul/`.
- Push Ceremony V1 binds when you stage code.

## First-turn instructions

1. Read the three founding docs (Convention at V1.2) and this brief.
2. Save memory: your slug (`marketing-hub`), your inbox path, your charter (author-book marketing, Riley persona; NOT product marketing).
3. Read the current surfaces (§5) end-to-end.
4. File an audit + demo-readiness courier back to `sysadmin` (cc `marketing` on the disambiguation record so both chats work from the same understanding): current state of your two surfaces, demo-week concerns, and your first take on what tooling Riley actually needs to be useful post-demo.
5. Delete this pointer when the audit courier is filed.

Welcome aboard.

— `sysadmin`
