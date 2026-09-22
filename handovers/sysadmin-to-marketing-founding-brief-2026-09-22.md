# SysAdmin → Marketing — Founding brief

**From:** `sysadmin` (via Paul) · **To:** `marketing` · **Date:** 2026-09-22 · **Status:** chartering. Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1` (V1.1), `PUSH-CEREMONY-V1` first.

## Why this chat exists

Marketing sits at the end of the author's journey, and every launch is one. Riley is the persona; the surface has two live faces (project-scoped tab + standalone hub) and a real body of work already ratified (MKT-004, MKT-005, MKT-006, MKT-008, MKT-009, MKT-010). The founding here is to bring you into the OS and give you the operating floor to work from — not to relitigate the marketing decisions already made, which have been landing at pace all summer.

## What you own

- **`/projects/[id]/marketing`** — the project-scoped Marketing tab (author's launch view for their book)
- **`/marketing-hub`** — the legacy standalone marketing hub (mirrors the legacy `/publishing-hub` and `/author-studio` pattern)
- **Riley persona** (renamed from Kai 2026-09-05; historical Eden → Riley on the Wright side, then Riley reassigned to Marketing)
- **All external marketing surfaces** — `/pricing` (page copy, not price accuracy), `/faq`, `/how-it-works`, `/free-analysis` form and follow-up email, marketing blog posts, campaign copy
- **Ad campaigns, funnel copy, comps positioning** — MKT-004/005/006 series is your inheritance
- **Post-launch campaign design** for authors' books (positioning, audience, launch plan, promo pushes)

## What you do NOT own

- **`/pricing` page price accuracy** — that's a three-way responsibility: `marketing` owns copy, `finance` signs off numbers/claims, `identity-billing` confirms implementation matches. See finance's state-of-monetisation §4.
- **Actual billing plumbing** — `identity-billing`. You reference plans, they enforce them.
- **Publishing surfaces** (`/projects/[id]/publishing`, `/publishing-hub`) — that's `publishing` chat. You get the book handed to you *after* launch prep; you don't own launch prep itself.
- **Free-analysis workflow backend** (n8n workflow `00.04 Free Manuscript Analysis`) — `sysadmin` owns the n8n side (it was recently rewired for Resend SMTP + Craft Call Cell). You own the *content* the workflow sends (Alex's assessment PDF, follow-up sequences) and the form UI on `/free-analysis`.

## Context you inherit — this is a large one

**Ratified marketing decisions** (all live in `docs/sis/marketing/` and referenced across pricing docs):

- **MKT-004** — pricing-response, 6 platform asks. Includes UTM capture + Vercel custom events (shipped, task #90).
- **MKT-005** — Free-analysis Craft Call Cell retrofit + content swaps + DOCX support (tasks #79-81).
- **MKT-006** — Marketing copy pack applied to free-analysis (task #84).
- **MKT-007** — Marketing status matrix.
- **MKT-008** — Pricing simplification memo (2026-08-10, Paul-ratified). **The £119 single-project pass was REMOVED here; £9.50 founding tier retirement Paul-ratified today (see `sysadmin-ratifications-and-rulings-2026-09-22.md`).** These are load-bearing for any marketing copy that names prices — do not use the pass, do not use £9.50.
- **MKT-009** — Public pages update handover.
- **MKT-010** — PDF template marketing addendum.

**Free-analysis pipeline** — currently active. Recent work this week (task #82, still `in_progress`): SMTP swap Gmail → Resend/Titan, email body trimmed to align with the ratified pricing. Smoke test is Paul's next click.

**Marketing surfaces status:**

- **`src/app/projects/[id]/marketing/page.tsx`** — 18KB, from 2026-09-05. Current project-scoped marketing tab. Riley is the persona.
- **`src/app/marketing-hub/page.tsx`** — 27KB legacy standalone, from March 2026. Very old — probably heaviest cleanup / migration debt in the marketing estate.
- **Trial ad** (`selfpub-uk-01`, £60) — finance's state-of-monetisation notes it has no readout in any instrument. Please confirm whether the ad ever ran and if so, where the results live.

## Blair demo (Wednesday 2026-09-24) — your part

Carl will show the Author's view of the Marketing hub — probably on Book 1 (Veil, post-launch — Riley planning promo) or Book 2 (Signal, pre-launch — Riley setting up positioning). Timing budget: 60-90 seconds.

**What you need to check this week:**
1. Does `/projects/[id]/marketing` render cleanly for both Book 1 (launched) and Book 2 (pre-launch)? What does Riley's chat greeting look like in each state?
2. Any P0 errors when a real user clicks in? (See I&B state-of-the-estate: `marketing-hub/page.tsx:128` gates on `role === 'admin'` — non-admins may hit a gate. Coordinate with `identity-billing` if this affects the demo.)
3. If Carl is going to say anything on-screen about pricing (comps, positioning), verify it matches the ratified MKT-008 position — three tiers £10/£19/£39 monthly, £7/£13/£27 annual, no pass, no founding.

## Post-demo priorities (initial view; re-triage after audit)

1. **Legacy `/marketing-hub` audit** — March 2026 file, heavy debt likely. Decide: refresh in place, migrate to project shell, or retire.
2. **Trial ad readout** — where does `selfpub-uk-01` live? Did it run? What did it teach? finance is waiting.
3. **£5/lead economics guardrail restated** — finance flagged (state-of-monetisation §5.4) that with the £119 pass gone, the tolerable cost-per-lead drops roughly an order of magnitude (conversion anchor becomes Starter £10, not pass £119). Re-price the ad economics accordingly.
4. **Post-launch author marketing tools** — Riley's actual product surface, distinct from AuthorsLab's own marketing. What can Riley DO for an author preparing a launch campaign?
5. **Pricing-page rewrite** if MKT-008 changes haven't fully propagated — coordinate with `finance` (numbers) and `identity-billing` (implementation) on the three-way sign-off model finance proposed.

## Coordination protocol

Per Courier Convention V1.1:
- Your inbox: `handovers/inbox/marketing/`.
- Primary coordination partners: `finance` (price accuracy, unit economics), `identity-billing` (implementation match), `publishing` (launch handoff — book arrives at Marketing after Publishing finishes), `publisher` (any book with a publisher relationship may have different marketing expectations — publisher-driven publicity, author's Substack fits into whose plan), `ux` (marketing page IA, `/pricing` treatment), `sysadmin` (n8n workflows for email sequences, SMTP integration).
- Decisions for Paul → pointer to `handovers/inbox/paul/`.
- Push Ceremony V1 binds when you stage code.

## First-turn instructions

1. Read the three founding docs and this brief.
2. Save memory: your slug (`marketing`), your inbox path, your charter (marketing station + all external marketing surfaces + Riley).
3. Read the audit files in §5 — current surfaces, MKT-004 through MKT-010 (in `docs/sis/marketing/`), and the ratifications courier for the pricing floor.
4. File an audit + demo-readiness courier back to `sysadmin` (cc `finance` on the trial-ad readout question, cc `publishing` on the launch-handoff seam): current state of your two surfaces, demo-week concerns, and your first take on the £5/lead re-pricing after the pass retirement.
5. Delete this pointer when the audit courier is filed.

You have the largest ratified body of work of any of the new chats. Read it, absorb it, honour it — no relitigation this turn. The forward priorities emerge from the audit.

Welcome aboard.

— `sysadmin`
