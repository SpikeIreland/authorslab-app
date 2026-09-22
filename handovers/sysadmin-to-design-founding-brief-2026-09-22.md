# SysAdmin → Design — Founding brief

**From:** `sysadmin` (via Paul) · **To:** `design` · **Date:** 2026-09-22 · **Status:** chartering. Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1` (V1.1), `PUSH-CEREMONY-V1` first.

## Why this chat exists

Design is a station on the author's journey where the *visual* work of the book happens — cover, interior layout, typographic identity. It has real depth (covers alone are the make-or-break single most visible artefact of a book) and real coordination demands (with Publishing for handoff to launch prep, with Publisher's Journey for cover approvals under a publisher relationship, with Marketing for cover-derived assets). Paul has substantial post-demo Design work planned; this brief exists to get you into the OS first and give you the site-architecture floor to design against.

## What you own

- The **`/projects/[id]/design` tab** — the project-scoped Design surface the author works in
- The **cover composer** (currently under `/api/projects/[id]/design/cover` — see TDP-DT-01 tasks #75-77)
- Design chat, cover generation flows (n8n: `5.2 Taylor Generate Covers`, migrated task #70)
- The **Taylor persona** on the design surface — currently shared with Publishing (see §3)
- Any future interior layout, typographic system, cover series work (trilogy identity, imprint styling)

## What you do NOT own — disambiguation

- **Publishing hub** (`/projects/[id]/publishing`, `/publishing-hub`) — that's `publishing` chat. See their brief for scope, but the short version is: they own the post-design *launch prep* (metadata, distribution setup, launch checklist). Design hands them the completed cover; they take it from there. **Coordination seam: cover-approved event.**
- **Publisher's Journey portal** (`/publisher/*`) — that's `publisher` chat. That's the *trade-side* audience view; when a publisher reviews and approves a cover through the portal, the approval flows back into Design's surface. **Coordination seam: cover approval loop.**
- **Marketing assets** (`/projects/[id]/marketing`) — that's `marketing` chat. Cover art gets used as source for marketing (crops, animations, social variants) but you don't own the marketing output — you own the source cover and hand it off.

## Persona ambiguity — flag for resolution

`Taylor` is currently the persona used for BOTH Design (`/projects/[id]/design`) and Publishing (`/projects/[id]/publishing`) — the "Taylor D&P" naming from earlier task work (#74, #75-77). The tab strip has them as two separate stations; the phase-4 derivations (`overviewDerivations.ts`) collapse them under Taylor. Whether Taylor stays as one persona covering both, or splits into two personas (one per station), is a design + product decision. Coordinate with `publishing` and `ux` on the resolution.

## Context you inherit

- **`src/app/projects/[id]/design/page.tsx`** — 15KB, from 2026-07-29. The current project-scoped design tab. Consumes `/api/projects/[id]/design/cover`, `/api/projects/[id]/design/chat`, `/api/projects/[id]/design/messages`.
- **`src/app/api/projects/[id]/design/`** — three sub-routes: `chat/`, `cover/`, `messages/`.
- **n8n workflow `5.2 Taylor Generate Covers`** — migrated 2026-08-05, task #70. Sits behind cover generation.
- **`docs/sis/taylor-dp/`** and **`docs/sis/design/`** — historical Design + Taylor D&P handovers. `docs/sis/design/2026-07-30-AL-UX-008-design-tab-composer-brief.md` is probably the most useful existing spec.
- **TDP-DT-01** (tasks #75, #76, #77) — Design tab cover composer + Supabase storage bucket + n8n changes. All shipped. That's your inheritance baseline.
- **AL-UX-004 §4-5** — the tab strip design system and Manuscript Room palette Design's surfaces sit inside.

## Blair demo (Wednesday 2026-09-24) — your part

Carl will show the Design tab on Book 1 (The Veil and the Flame — completed) and probably demo cover generation on Book 2 (The Signal and the Shadow, in edit). Timing budget: 60-90 seconds combined across the two moments.

**What you need to check this week:**
1. `/projects/[id]/design` renders cleanly for both Book 1 (with existing cover — needs to look intentional) and Book 2 (empty cover state — needs to look like "ready to generate").
2. Cover generation actually fires (n8n workflow 5.2 is active). If it errors on-camera, that's the demo hurt.
3. Coordinate with `publisher` on whether the cover shown for Book 1 also appears in the publisher portal's mock (design continuity across the two-browser story is a small polish that reads as maturity).

Not asking you to design new work for Wednesday — asking you to verify what's there holds up under a live click.

## Post-demo priorities (initial view; you'll re-triage after audit)

1. **Design tab audit** — a full read of what the current surface does vs what Paul wants next. Paul has flagged "quite a bit of work" coming; this audit sets up that conversation.
2. **Cover approval loop with `publisher`** — currently no wiring between a publisher's cover approval (in the portal) and the Design surface's state. Design a workflow.
3. **Trilogy / series identity** — Carl's trilogy is the exemplar case for cover series design. Consider affordances for series-level design decisions (shared palette, spine typography, cover-family logic).
4. **Interior layout / formatting** — not currently a Design surface at all; probably belongs to Publishing (task #71 was "n8n: migrate 6.1 Format Manuscript" — completed). Boundary check with `publishing` on where formatting starts and stops.
5. **Persona ambiguity resolution** (see §3 above) — align with `publishing` and `ux`.

## Coordination protocol

Per Courier Convention V1.1:
- Your inbox: `handovers/inbox/design/`. Check at every turn start.
- Direct chat-to-chat coordination — cc `sysadmin` when the outcome touches shell/schema/deployment.
- Primary coordination partners: `publishing` (cover→launch handoff), `publisher` (cover approval loop), `ux` (visual system, tab strip, workspace layout), `marketing` (cover-derived assets), `sysadmin` (storage buckets, n8n workflows, schema).
- Decisions for Paul → pointer to `handovers/inbox/paul/`. Do not block.
- Push Ceremony V1 binds when you stage code.

## First-turn instructions

1. Read the three founding docs and this brief.
2. Save memory: your slug (`design`), your inbox path, your charter.
3. Read the audit files named in §5 — the current surface, the API routes, the AL-UX-008 composer brief, the TDP-DT-01 completion notes.
4. File an audit + demo-readiness courier back to `sysadmin` (with cc pointers to `publishing`, `publisher`, `ux`): current state of `/projects/[id]/design`, demo-week concerns if any, and your first take on the persona ambiguity (Taylor for both, or split).
5. Delete this pointer when the audit courier is filed.

Paul has more substantive Design work coming after the demo — this brief exists to get you positioned to receive it cleanly, not to commission that work yet.

Welcome aboard.

— `sysadmin`
