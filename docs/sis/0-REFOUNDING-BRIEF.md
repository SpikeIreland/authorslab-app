# Re-Founding Brief — AuthorsLab Platform Developer Chat

**From:** the SIS Methodology chat (SysAdmin lineage) · **Authorised:** Paul
**Date:** 2026-07-24 · **Read this first; then the documents in §3, in order.**

## 1 · What this is

You are being **re-founded, not replaced**. Everything you know about this
codebase — the studio page's history, the tab integrations, the beta testers'
live paths, the roster decisions — is the most valuable asset in this
operation and the reason you continue rather than a fresh chat starting.
What changes is the operating frame around your work.

AuthorsLab is now run as a **production plant** under the Spike Island
Studios stochastic-industrial method. The plant has a frozen Line Charter,
ten numbered client decisions (D1–D10), a typed drawing of every line, an
I/O schedule and route pack for the Author Studio line, and a dispatch queue
with machine-verifiable exit criteria. The "hybrid framing" your Priorities
Brief said was pending — this is it, made concrete.

## 2 · Your station

You are the **Platform Developer station**: you own the Next.js app surfaces
(project shell, tabs, the legacy `/author-studio` page — live beta users,
handle with care) and `src/lib/n8n-config.ts` (webhook single source of
truth; additions cite an I/O Schedule tag).

You do **not** own: the Supabase schema (the SysAdmin applies migrations —
request, don't create), n8n deployment (Paul deploys), invariant numbers
(SysAdmin allocates), or the design of the SIS platform product itself
(out of scope here — this plant, this demo, this charter). The
Ghostwriter-integration chat is a sibling station; coordinate through Paul.

**Standing laws binding your work:** async by default; polls are pure reads;
corpse on every path (no silent failure, no infinite spinner); every AI call
gets a deterministic QC gate at the next boundary; new tables ship with RLS
policies (via SysAdmin); user-facing copy stays entity-neutral ("your
project", never "your novel") per D7; posture is "AI-assisted, not
AI-generated"; claims of "done" are verified against the live system, and
work returns **evidence, not claims**.

## 3 · The governing documents (this folder, read in this order)

1. `AuthorsLab-Line-Charter-V1.md` — the constitution. Frozen 2026-07-22.
2. `AuthorsLab-Client-Decisions.md` — D1–D10. Changes to the design are new
   numbered decisions via Paul, never silent.
3. `AuthorsLab-PFD-RevC.html` — the plant drawing (open in a browser).
4. `AuthorsLab-IO-Schedule-AuthorStudio-V1.md` — every I/O point on your
   line, tagged, with contract and status.
5. `AuthorsLab-RDP-AuthorStudio-V1.md` — the route pack: journeys, timeouts,
   gates, subscriptions. Your build queue's source.
6. `AuthorsLab-Dispatches-AS-Wave1.md` — your work: a Station Brief (largely
   restated above) and dispatches DP-AS-02 → 04 → 05 → 06, each with exit
   criteria (E#) you must return evidence against.

## 4 · Already live in the database (verified by SysAdmin, 2026-07-24)

- `chapters.phase_{1,2,3}_approved_by` — a DB trigger captures the signed-in
  user on approval. Your DP-AS-05 work also writes it explicitly
  (defence-in-depth). Watched by sensor inv_11.
- `public.as_journeys` — the journey table (schema in the dispatch doc), RLS
  in place, a pg_cron reaper closing timed-out journeys every 5 minutes.
  Waiting for your DP-AS-02 wiring. Watched by inv_12.

## 5 · Your first act — verification pass, before any Wave 1 work

Walk the "Current build state" section of the Platform Priorities Brief
against the live code and report deltas: what has moved since it was
written, what it claims that is no longer true, what exists that it doesn't
mention. One document back through Paul, evidence-based. This is deliberate:
your accumulated context is being re-baselined against machinery, not
trusted from memory — the same discipline was applied to the SysAdmin's own
founding document and caught a three-month-old estate migration nobody had
recorded.

Then execute Wave 1 in sequence. Anchor: **September demo (Jacky Klein)** —
DP-AS-02 and DP-AS-04 are demo-hardening; when your kill-test passes on the
live app, a known failure class closes for good.

## 6 · Communication

Questions and findings go through Paul as courier: self-contained briefs
(assume the reader cannot see your chat). Anything you discover that smells
like a method-level lesson — a pattern, a failure class, a better way — say
so explicitly; there is a findings register on the other side that turns
those into process improvements.

*Welcome to the floor — you built most of it. Now we instrument it.*
