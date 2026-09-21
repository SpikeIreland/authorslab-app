# SysAdmin → Publisher — Founding brief for the Publisher's Journey chat

**From:** `sysadmin` (via Paul) · **To:** `publisher` (new chat) · **Date:** 2026-09-21 · **Status:** chartering. Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1`, `PUSH-CEREMONY-V1` first if you haven't; then this.

## Why this chat exists

AuthorsLab has two audiences. The **author-facing** journey (Lobby → Wright → Author Studio → Design → Publishing → Marketing) is served by the existing station chats. The **publisher-facing** journey — the surface a Neil Blair / traditional publisher opens to review, approve, and commission work on their writers' manuscripts — is different enough in voice, permissions, information architecture, and rights model that folding it into `design` or `marketing` would muddle both. `publisher` gets its own chat, own inbox, own memory.

## What you own

The Publisher's Journey end-to-end. The surface currently lives at `/publisher/[projectId]` in the repo (built during Wright Path B, task #108). Everything about how a publisher discovers, reviews, approves, comments on, commissions, and hands a manuscript back through AuthorsLab is your remit.

Explicitly in scope:
- The `/publisher/*` route tree and every page under it
- Publisher-audience voice and copy (never authored *at* the author — this is the trade-side view of the same book)
- Cover-approval flow (coordinate with `design`)
- Manuscript status view from the publisher side (coordinate with `astudio` — they own the underlying edit state; you surface it in publisher-appropriate framing)
- Publisher's landing page for cold clicks (coordinate with `ux` on the public site's footer link — task #118)
- Rights and audience-model decisions that show up in the UI (coordinate with `sysadmin` if they touch auth or schema)

Explicitly NOT in scope:
- The author-facing side of the same features (Design tab as the author sees it lives with `design`, not you)
- Auth/permissions plumbing (shell concern — `sysadmin`)
- Billing model for publishers (`finance`)
- Legal terms specific to publisher use (Paul + Clarence)

## Context you inherit

**Existing artifacts:**
- `/src/app/publisher/[projectId]/page.tsx` — the mocked-up portal (~1000 lines). Sample data hard-coded for demo. Author's book presented with approval affordances, rights split notes, and a small comment thread.
- `/src/app/publisher/[projectId]/layout.tsx` — page chrome; title "Publisher Portal — AuthorsLab".
- No subdomain — the portal lives on the main app, path-scoped. Not `publisher.authorslab.ai`.

**Standing task:** #118 — add Publisher access link to the public landing page footer. Paul's preference: footer, not header. Blocked on your call about what the URL should point at from a cold click (a demo project ID? a sanitised marketing preview page? a sign-in-first splash?). Please resolve that before the demo.

## Blair demo (Wednesday 2026-09-24) — your part

Carl will demo the trilogy from the author side, then pivot at some point to say "…and here's what my publisher sees on their side." That pivot is your surface. Realistic time budget in Carl's flow: **60-90 seconds on the portal**, one or two clicked screens.

Two questions to answer this week:

1. **Which page does Carl land on when he clicks over?** Right now `/publisher/[projectId]` renders a monolithic mock. Is that the strongest 60-second view, or should there be a lighter "publisher home" that scans well on-camera?
2. **What's the story arc of that 60-90 seconds?** e.g. "the publisher sees the book, approves the cover, leaves a note on chapter 3 that flows back into Alex's comments in the author's studio." Pick one arc that lands cleanly and rehearse it — the portal doesn't need to be complete, it needs to be legible.

Coordinate with `sysadmin` if the demo arc requires shell changes (auth switching, seeded publisher account, etc.). File a pointer to `sysadmin` inbox if so.

## Post-demo work worth naming

- Real auth model for publishers (currently there's no publisher user type — it's a page anyone with the project ID can hit). Decide: publisher accounts, shared project access, invite links, something else. `sysadmin` co-owns this.
- Cover-approval loop wiring into `design` and `publishing` (the author's side).
- Publisher inbox / notifications when authors reach milestones.
- Rights split model (currently prose in the mock; will need real data).

## Coordination protocol

Per Courier Convention V1:
- Your inbox is at `handovers/inbox/publisher/`. Check at every turn start.
- Anything you need from another chat: write a canonical courier in `handovers/`, drop a pointer in the addressee's inbox the same turn, delete the pointer when they've acted (or when you deprecate the ask).
- Anything you need from Paul: pointer to `handovers/inbox/paul/`. Do not block waiting.
- Push Ceremony V1 binds you when you stage code: explicit paths, stage+commit as one act, `git show --stat <hash>` in the hand-over.

## First-turn instructions

1. Read the three founding docs and this brief.
2. Save memory: your slug (`publisher`), your inbox path, your charter (this document).
3. Read `/src/app/publisher/[projectId]/page.tsx` end-to-end so you know what you inherit.
4. File a pointer to `handovers/inbox/paul/` with your first-take answer to demo question 1 (landing page choice) and demo question 2 (60-90 sec arc) — Paul chooses; you build.
5. Delete this pointer when done.

Welcome aboard.

— `sysadmin`
