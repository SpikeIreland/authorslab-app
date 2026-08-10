# R1 · MVP launch checklist

**AL-PDC-R1-CHECKLIST-001 · 2026-07-30**
**From:** Platform Developer station
**Target:** Everything that must be true before we can safely point strangers at `authorslab.ai`

This is the punch list for shipping R1 (Editing Studio MVP). Each item has a clear owner and a clear "done" state. Items with **PAUL** as owner mean the item needs an answer or an action from Paul specifically before another chat can proceed. Items with **BLOCKING?** = yes cannot be worked around; = no means the launch can ship with the item deferred/incomplete but should be tracked.

## 1 · Product / feature-gating — the "unplug"

| Item | Owner | Done state | Blocking? |
|---|---|---|---|
| Overview stepper shows only stages 1-3 as active journey; stages 4-5 rendered as "Coming soon" (dashed, muted, non-clickable) | Platform Dev | Live on `main` | Yes |
| Project tab strip hides or gates Ghostwriter/Design/Publishing/Marketing tabs (recommend: show with "Soon" chip like Script, non-clickable) | Platform Dev | Live on `main` | Yes |
| Landing new-book flow simplified to upload-only (Ghostwriter path hidden) | Platform Dev | `NewProjectModal` shows upload path only | Yes |
| Editor greeting messages on Overview reference only editing personas (nothing mentions Riley/Ghostwriter as current option) | Platform Dev | Reviewed in `overviewDerivations.ts` | Yes |
| Old `/author-studio` legacy route: decide keep/redirect/leave-as-is | Platform Dev | See note below | No |

Note on `/author-studio` — post-AL-UX-004 users don't reach this route in the new nav. It still exists and works. Cleanest for MVP: leave as-is (fully-reskinned per AL-UX-007). Redirect can wait for the full-rebuild pass.

## 2 · Onboarding flow

| Item | Owner | Done state | Blocking? |
|---|---|---|---|
| First-time signup flow tested end-to-end by a fresh account | Platform Dev + PAUL (test) | Real signup, real manuscript upload, real editor session, no dead-ends | Yes |
| `/onboarding` page reviewed for MVP framing (references only editing) | Platform Dev + UI/UX | Copy scanned, no mentions of Design/Publishing/Marketing as active | Yes |
| Post-signup redirect works cleanly (currently → `/projects/[id]` after manuscript upload) | Platform Dev | Verified live | Yes |
| Password-reset flow works | PAUL (test) | Real reset, real link, real login | Yes |
| Email confirmation works (if enabled — currently unclear whether Supabase Auth requires confirmation for signups) | PAUL (test) | Signup produces confirmation email that arrives + links back correctly | Yes |
| Error handling for common uploads: bad file format, oversized file (>50MB), corrupt PDF, DOCX with unusual formatting | Platform Dev + PAUL (test) | Graceful error UI, no white screens | Yes |

## 3 · Billing / subscriptions

**Updated 2026-08-05:** Pricing Chat has decided the tier structure and created the Stripe catalogue on a new dedicated `AuthorsLab` account (`acct_1U0u4gEGeehw2YKO`). Full details in `docs/sis/pricing/AL-Stripe-Launch-Handover.md`. This section reflects the new work.

**Decided tiers (all £ GBP):**

- **Starter** £10/mo (`starter_monthly`) or £84/yr (`starter_annual`) — 1 pass/mo, 1 project
- **Author** £19/mo (`author_monthly`) or £156/yr (`author_annual`) — 4 passes/mo, unlimited projects
- **Author Founding** £9.50/mo (`author_founding`) — 11 beta authors only, **NEVER public**
- **Pro** £39/mo (`pro_monthly`) or £324/yr (`pro_annual`) — 10 passes/mo, unlimited projects
- **Single-Project Pass** £119 one-time (`single_project_pass`)
- **Pass-to-subscription credit (PD-4):** £13 credit if a pass buyer subscribes within 90 days

| Item | Owner | Done state | Blocking? |
|---|---|---|---|
| MVP tier structure + Stripe catalogue | ✅ **DONE** by Pricing Chat 2026-08-05 | Live per handover doc | — |
| KYC / business-profile verification on new Stripe account | PAUL | Payouts unblocked in Stripe dashboard | Yes |
| Vercel env vars swapped to NEW Stripe account keys | PAUL + Platform Dev | Both publishable + secret keys point at `acct_1U0u4gEGeehw2YKO` | Yes |
| Webhook endpoint + signing secret registered on the NEW Stripe account | PAUL + Platform Dev | Endpoint added; `STRIPE_WEBHOOK_SECRET` in Vercel matches | Yes |
| Refactor Checkout to resolve prices via **lookup key** (not hardcoded IDs) | Platform Dev | Uses `/v1/prices?lookup_keys[]=<key>` per handover §2.2 | Yes |
| Checkout mode: `subscription` for subs, `payment` for `single_project_pass` | Platform Dev | Correct mode set per lookup key | Yes |
| Webhook handler syncs tier + status to Supabase `subscriptions` (from price's product metadata) | Platform Dev | Events: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed` | Yes |
| Pass-credit mechanic (PD-4): 90-day lookup + £13 credit on subscription checkout | Platform Dev | App-side pass-date lookup; Stripe carries credit via customer balance or single-use coupon | Yes |
| Entitlement display in dashboard — passes used (from `lmo_ledger`) vs `passes_per_month`; projects vs `projects_allowed` | Platform Dev | Visible on account/subscription surface | Yes |
| Customer Portal enabled + configured (cancel + plan switch among 6 public prices; **exclude** `author_founding`) | PAUL | Live in Stripe dashboard | Yes |
| Smart Retries + automatic card updates + dunning emails enabled | PAUL | Enabled in Stripe dashboard | Yes |
| Branding: logo, Manuscript Room palette, statement descriptor `AUTHORSLAB`, support email | PAUL | Live in Stripe dashboard | Yes |
| Payment methods: cards + Link + Apple Pay + Google Pay | PAUL | Enabled in Stripe dashboard | Yes |
| End-to-end live test purchase (£10 Starter monthly → refund → cancel) BEFORE public traffic | PAUL + Platform Dev | Verified live | Yes |
| Failed-payment path tested (card declined, insufficient funds) | PAUL + Platform Dev | User sees clear error, no ghost subscription | Yes |
| Spike Island Stripe account: archive AuthorsLab-related products (do NOT delete — needed for historical refunds) | PAUL | Archived in old account, account stays open | No |
| Founding Author announcement sent BEFORE public pricing switch + 11 beta authors subscribed to `author_founding` | PAUL | Sent + subscribed | Yes |
| Tax setup (UK VAT / overseas digital services) | PAUL's accountant | Deferred per handover — Stripe Tax enabled later without catalogue changes | No |
| Post-launch: analytics on paying-user conversion vs signup-only | Platform Dev + Marketing | Instrumentation live | No |

## 4 · Legal pages (Clarence drafts already delivered; need placeholder fills)

**All 11 items below need PAUL's answers before Clarence's drafts can ship. Full details in `docs/Legal/drafts/README.md`.**

| # | Item | Where |
|---|---|---|
| 1 | Registered company name + number + address | Privacy §1/§15, ToS §1.1/§15.7, DPA opening |
| 2 | ICO registration number (if you have one) | Privacy §1 |
| 3 | Supabase region you're on (eu-west-2?) | Privacy §5.1, Subprocessors |
| 4 | Analytics vendor confirmation — sticking with Vercel? | Privacy §3.6, Cookie §2.2 |
| 5 | Self-serve chat deletion at launch — feature ready or roadmap? | Privacy §10 |
| 6 | Regions for APITemplate.io / ConvertAPI / Resend (EU-preferred?) | Subprocessors |
| 7 | Confirm SMTP provider is Resend | Subprocessors |
| 8 | SCC governing law — Ireland OK? | DPA Schedule 2 |
| 9 | VAT-registered? (affects refund policy) | ToS |
| 10 | DPAs already signed with Anthropic / OpenAI / Supabase? | DPA |
| 11 | `{{EFFECTIVE_DATE}}` — pick a date (probably public-launch day) | All 5 policies |

**Once PAUL answers:** Platform Dev fills the placeholders across the five markdown drafts, then either UI/UX or Platform Dev builds the `/privacy`, `/terms`, `/cookies`, `/subprocessors`, `/dpa` public routes wrapped in MarketingNav + MarketingFooter. ~2 hours of route work. Add footer links.

All items above are **BLOCKING** for launch.

## 5 · Public pages content — deferred from AL-UX-006

| Item | Owner | Done state | Blocking? |
|---|---|---|---|
| `/pricing` body copy — subscription tier prices, feature comparison | **PAUL + Financial Model + UI/UX** | Live copy on the page | Yes |
| `/faq` body copy — real answers to the questions Clarence answered generically | PAUL + UI/UX | Live copy on the page | Yes |
| `/free-analysis` body copy — real turnaround times, accepted formats, positioning | PAUL + UI/UX | Live copy + submit flow working | No (page can ship as-is; free-analysis workflow is currently inactive on n8n) |
| Landing page copy for editing-only MVP framing | Marketing + UI/UX | Copy reflects "AI editor for your novel" positioning, not full-platform | Yes |
| How-it-works page for editing-only | Marketing + UI/UX | Reflects 3-step editing journey, not 5-step full journey | Yes |
| MarketingFooter has links to all 5 legal pages once they exist | UI/UX or Platform Dev | Links present, all resolve | Yes |

## 6 · Free-analysis workflow — activation now a coordinated retrofit (updated 2026-08-05)

**Decision made** (Pricing Chat + Marketing, ratified by Paul): activate for MVP as the primary top-of-funnel.

**Scope of work discovered on inspection** (Marketing chat inspected `4GIq7o4cyvk3zCWm` — findings in `docs/sis/marketing/2026-08-05-AL-MKT-005-free-analysis-workflow-findings.md`; full Platform Dev response in `docs/sis/platform-dev/2026-08-05-marketing-005-response.md`):

The workflow is legacy (2026-04-23, pre-pivot, pre-Craft-Call). Activating as-is would ship $399-Author-Package upsells and old-brand emails to our first leads. Retrofit required.

| Item | Owner | Done state | Blocking? |
|---|---|---|---|
| Scope decision (Option A whole-manuscript vs Option B first-3-chapters) | ✅ **DECIDED 2026-08-05 by Paul: Option A (whole manuscript)** | — | — |
| £119 Pass definition (one editor pass vs full three-editor journey) | ✅ **DECIDED 2026-08-05 by Paul: one full journey (Alex + Sam + Jordan)** — Pricing Chat to update `passes_per_month` metadata on the Pass product from 1 → 3 (or equivalent) so entitlement display counts correctly | — | — |
| Craft Call Cell retrofit — 4 direct `lmChatAnthropic` nodes → Execute Workflow to Cell (station_id `alex.free-analysis`) | Platform Dev | LMO ledger rows populate on new runs | Yes |
| DOCX support — page validator + workflow-side extract | Platform Dev | Page accepts DOCX; workflow processes it | Yes (strongly requested by Marketing) |
| Final Synthesis positioning content — calm voice, £-correct, Pass/Starter conversion + £13 bridge | Marketing (draft) → Platform Dev (apply) | Prompt content updated in workflow | Yes |
| Delivery email content — Manuscript Room brand voice | Marketing (draft) → Platform Dev (apply) | Email template updated | Yes |
| Webhook response copy | Marketing (draft) → Platform Dev (apply) | Response text updated | Yes |
| APITemplate.io PDF template — Manuscript Room render | PAUL (create in APITemplate.io using Marketing's brief) → Platform Dev (wire new template ID) | New template ID referenced in workflow | Yes |
| Gmail node → brand sender (`hello@authorslab.ai`) | Demo & Content Ops (mailbox) → Platform Dev (wire) | Emails send from brand address | Yes |
| Smoke test end-to-end (real submission → real email + PDF + LMO row) | Platform Dev + PAUL | Verified | Yes |
| Activation (`active=true`, publish) | Platform Dev | Live on production | Yes |

Timeline estimate: 10-14 days from 2026-08-05, dependent on Marketing drafts + brand-mailbox + APITemplate template landing.

## 7 · Support / operations

| Item | Owner | Done state | Blocking? |
|---|---|---|---|
| Support email inbox exists + monitored (`support@authorslab.ai`) | PAUL | Inbox live, forwarding set up | Yes |
| First-response SLA decided (24h? 48h? next business day?) | PAUL | Documented | No |
| Failure alerting — Vercel deploy failures, Supabase downtime, n8n workflow failures | Platform Dev | Alerts route somewhere PAUL sees | Yes |
| Runbook for common incidents (n8n workflow down, Supabase migration needed, etc.) | Platform Dev | Doc under `docs/sis/platform-dev/runbook.md` | No |

## 8 · Analytics / instrumentation

| Item | Owner | Done state | Blocking? |
|---|---|---|---|
| Vercel Analytics confirmed enabled in prod | PAUL | Verify in Vercel settings | Yes |
| Event tracking on: signup, first-manuscript-upload, first-editor-session, subscription-start, subscription-cancel | Platform Dev | Events fire, visible in analytics dashboard | No (nice-to-have — can add post-launch) |
| UTM parameter capture on all inbound traffic | Platform Dev | Marketing test URLs attributed | Yes (once Marketing starts running ads) |
| Cost/attribution data pipe from LMO ledger to a viewable dashboard | Platform Dev + Financial Model | Financial Model can pull per-user cost | No |

## 9 · Environment / infrastructure

| Item | Owner | Done state | Blocking? |
|---|---|---|---|
| All required Vercel env vars set in prod (confirmed during n8n migration; verify again post-MVP-unplug) | PAUL + Platform Dev | Vercel settings screenshot / checklist | Yes |
| Custom domain `authorslab.ai` pointed at Vercel | PAUL | Site resolves at custom domain, SSL cert active | Yes (may already be true) |
| Backup/restore process for Supabase understood | PAUL | Basic disaster-recovery plan | No |
| Rate limiting on public API routes | Platform Dev | Consider basic rate limits on `/api/auth/*` and other sensitive routes | No |

## 10 · Marketing readiness (for launch coordination, not launch itself)

Marketing chat owns these; not blockers for launch but shape the launch day story.

| Item | Owner | Done state | Blocking? |
|---|---|---|---|
| Elevator pitch in 3 lengths | Marketing | Documented | No |
| First trial ad live (~$50-100) | Marketing | Live on Meta/X | No |
| Audience segments identified | Marketing | Working list | No |
| Launch-day announcement plan (X post, LinkedIn, Substack, personal networks) | Marketing + PAUL | Coordinated | No |

## 11 · Reminder — the "what am I waiting on" summary for Paul

**Answers/actions I need from you (unblocks other chats):**

- **Clarence Legal placeholders** — 11 items in §4
- **Stripe KYC + dashboard config** — new `AuthorsLab` account needs verification and portal/branding/retries setup (§3 items assigned to PAUL)
- **Vercel Stripe env-var swap** — publishable + secret keys point at the new account
- **Founding Author announcement** — sent to 11 beta authors before public pricing switch
- **Free-analysis workflow activation decision** — §6 (Marketing chat has a view; Paul confirms)
- **Support email inbox** setup + first-response SLA
- **Vercel custom domain** verification
- **Test participation for you** on §2 (signup flow), §3 (billing end-to-end + refund/cancel test), password reset, email confirmation

**Decisions from other chats I'm waiting on:**

- ~~Financial Model → MVP tier prices + structure~~ ✅ **DONE 2026-08-05** — see §3
- Marketing → landing page positioning direction (feeds §5)
- UI/UX → deferred public page copy (feeds §5), footer legal-links after legal pages exist

**Platform Dev's own next moves in this chat** (unblocked, can start now):

1. Execute the MVP unplug (§1) — half-day of code, small commit, ships to production once merged
2. Confirm environment variables and analytics wiring (§8, §9) — coordinate with Paul on Vercel access
3. Standby for inputs from other chats + fill Clarence placeholders as Paul's answers arrive

## 12 · Ready-to-ship criterion

R1 ships when every item marked **Blocking? = Yes** shows **Done state = achieved**. Non-blocking items land in the post-launch backlog and get worked in sequence.

Expected timeline: 10-14 days from today (2026-07-30) if none of the human-in-the-loop items (Paul's answers, Financial Model tier decisions, Marketing positioning) stall. Realistic: mid-August 2026.

— Platform Developer station
