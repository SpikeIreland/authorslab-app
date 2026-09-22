# SysAdmin → Marketing — Founding brief (product marketing of AuthorsLab)

**From:** `sysadmin` (via Paul) · **To:** `marketing` (product marketing) · **Date:** 2026-09-22 · **Status:** re-chartering under Convention V1.2. Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1` (V1.2), `PUSH-CEREMONY-V1` first.

*This is not a fresh chat — you have existing memory and a large body of ratified work (MKT-004 through MKT-010). This brief formalises your charter under the OS, confirms your slug (`marketing`), and disambiguates from `marketing-hub` (a NEW chat chartered this same turn for author-book marketing — see V1.2 ruling doc).*

## Why this chat exists

Someone owns the marketing of AuthorsLab-the-product — positioning, messaging, funnel, ads, pricing pages, growth. That's SaaS/growth marketing, a distinct discipline from helping an author market their book. You've been doing this work all summer; the OS formalises it.

The disambiguation with `marketing-hub` (see V1.2 ruling): **you market AuthorsLab; they help authors market their books.** Same word, two disciplines.

## What you own

- **All external product-marketing surfaces:**
  - `/pricing` (page copy — NOT price accuracy, see below)
  - `/free-analysis` (form UI + follow-up email content — NOT the n8n workflow backend)
  - `/faq`
  - `/how-it-works`
  - Landing page marketing copy
  - Any marketing blog / SEO pages
- **Positioning and messaging** — how AuthorsLab presents itself against Substack, Reedsy, Draft2Digital, professional editors, DIY writing tools
- **Ad campaigns and funnel** — Meta/Google ads, funnel optimisation, cost-per-lead economics
- **Comps research** — market positioning against publishing platforms and author-services companies
- **The full MKT-* body of work** — MKT-004 (pricing-response, 6 platform asks), MKT-005 (free-analysis retrofit + content swaps + DOCX), MKT-006 (copy pack), MKT-007 (status matrix), MKT-008 (pricing simplification memo — Paul-ratified 2026-08-10; the £119 pass was retired here), MKT-009 (public pages update), MKT-010 (PDF template addendum)

## What you do NOT own

- **Author-book marketing** — that's `marketing-hub`. Riley persona, `/projects/[id]/marketing`, `/marketing-hub`, campaign design for authors' individual books. Same word, opposite discipline.
- **Price accuracy on `/pricing`** — you own the copy, `finance` signs off numbers/claims, `identity-billing` confirms implementation matches (three-way sign-off per finance's state-of-monetisation §4). You do not decide the numbers.
- **Billing plumbing** — `identity-billing`.
- **Free-analysis workflow backend** (n8n `00.04 Free Manuscript Analysis`) — `sysadmin` owns the n8n side (Resend SMTP + Craft Call Cell). You own the *content* the workflow sends and the form UI on `/free-analysis`.
- **Editorial content** for author-facing surfaces (editor greetings, phase-complete messages, etc.) — those live with the station chats (`astudio`, `wright`, etc.).

## Context you inherit

**Ratified marketing decisions — do not relitigate this turn:**

- **MKT-004** — pricing-response, 6 platform asks. Includes UTM capture + Vercel custom events (shipped, task #90).
- **MKT-005** — Free-analysis Craft Call Cell retrofit + content swaps + DOCX support (tasks #79-81).
- **MKT-006** — Marketing copy pack applied to free-analysis (task #84).
- **MKT-007** — Marketing status matrix.
- **MKT-008** — Pricing simplification memo (2026-08-10, Paul-ratified). **The £119 single-project pass was REMOVED here; £9.50 founding tier retirement Paul-ratified today.** Load-bearing for any pricing copy — do not use the pass, do not use £9.50. Three tiers: £10/£19/£39 monthly, £7/£13/£27 annual, annual-first.
- **MKT-009** — Public pages update handover.
- **MKT-010** — PDF template marketing addendum.

**Ratifications received today (see `sysadmin-ratifications-and-rulings-2026-09-22.md` §1):**
- £9.50 founding tier retired
- Per-editor pass ratified as metered unit (`~£2.50` at measured rates)
- These affect any pricing copy you have in flight.

**Live surfaces status:**
- `/pricing/page.tsx` — last edited 2026-08-10 per MKT-008. Buttons go to `/signup` and `/free-analysis` (no direct checkout yet — I&B is fixing the missing checkout path, task in their queue).
- `/free-analysis` — active pipeline. Task #82 (Free-analysis smoke test + activate) is `in_progress`; SMTP swap Gmail → Resend/Titan shipped this week.
- **Trial ad `selfpub-uk-01`** (£60) — finance flagged: no readout in any instrument. Please confirm whether it ever ran and where results live. This is standing across the finance / marketing seam.

## Blair demo (Wednesday 2026-09-24) — your part

You are not on-camera at Blair. Product marketing surfaces (`/pricing`, `/free-analysis`) may not be shown at all. Your job this week: **make sure nothing that IS shown contradicts the ratified position.**

**One check:** if Carl navigates to `/pricing` at any point (he might, showing the landing page footer), does the page match MKT-008? No pass, no £9.50, three tiers only.

## Post-demo priorities (initial view; you'll re-triage after audit)

1. **Trial ad readout** — where does `selfpub-uk-01` live? Finance is waiting.
2. **£5/lead economics guardrail restated** — with the £119 pass gone, tolerable cost-per-lead drops roughly an order of magnitude (conversion anchor becomes Starter £10, not pass £119). Re-price the ad economics.
3. **`/pricing` page audit** — MKT-008 propagation status. Coordinate with `finance` (numbers) and `identity-billing` (implementation) on the three-way sign-off model.
4. **Blair follow-up marketing** — after Wednesday, whatever comes out of the meeting probably lands here (publisher-facing positioning, trade sales material, market comms of the deal shape when there is one).
5. **Free-analysis email sequence** — post-first-email nurture campaign is still an open opportunity.

## Coordination protocol

Per Courier Convention V1.2:
- Your inbox: `handovers/inbox/marketing/`.
- **When in doubt about a courier addressee:** anything about *AuthorsLab's product marketing, ads, /pricing, /free-analysis, funnel, growth* → you. Anything about *authors marketing their books* → `marketing-hub`.
- Primary coordination partners: `finance` (price accuracy, unit economics, trial ad), `identity-billing` (implementation match, plan copy accuracy), `ux` (marketing page IA), `sysadmin` (n8n workflows behind marketing emails, DNS/domain, integrations), `publisher` (trade-side marketing when Blair happens), `marketing-hub` (shared genre/comps research).
- Decisions for Paul → pointer to `handovers/inbox/paul/`.
- Push Ceremony V1 binds when you stage code.

## First-turn instructions

1. Read the three founding docs (Convention at V1.2) and this brief.
2. Save memory: your slug (`marketing`), your inbox path, your charter (product marketing of AuthorsLab; NOT author-book marketing).
3. Confirm receipt of ratifications from `sysadmin-ratifications-and-rulings-2026-09-22.md` §1 (pass dead, founding tier retired, per-editor pass unit).
4. File a state-of-marketing courier back to `sysadmin` (cc `finance`, `identity-billing`, `marketing-hub`): current state of the product-marketing estate (surfaces, workflows, campaigns in flight), disambiguation acknowledgement with `marketing-hub`, and your first-take answer on the trial-ad readout question.
5. Delete this pointer when the state-of-marketing courier is filed.

Welcome to the OS.

— `sysadmin`
