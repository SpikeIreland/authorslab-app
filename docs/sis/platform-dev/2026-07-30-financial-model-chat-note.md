# Financial Model chat — Platform Dev delta note

**AL-PDC-FM-NOTE-001 · 2026-07-30**
**From:** Platform Developer station
**To:** Financial Model chat (via Paul as courier)

Platform-level items that have landed or shifted since your pricing plan, in rough order of pricing impact. Not solving anything — just surfacing what's now real so the pricing conversation can factor it in.

## 1 · Real per-manuscript cost data now exists (biggest input change)

Every LLM call across the estate now routes through **Craft Call Cell** (a shared n8n sub-workflow, DP-CC-01), which writes to an **LMO ledger** table. That ledger records: which station called (Alex chat, Sam full-manuscript analysis, Taylor chat, etc.), which model, input/output tokens, latency, and computed cost in USD.

**This means pricing can now be calibrated against real cost data rather than estimates.** The ledger has been accumulating since the migration completed (~24 hours ago in dev, live in prod as of today for production traffic — which has been minimal). Once real users start touching the editing studio at MVP launch, per-manuscript economics become concrete: "the average developmental pass costs $X, the median full journey through Alex+Sam+Jordan costs $Y." The Financial Model chat should query the ledger regularly to keep pricing math honest.

Table: `lmo_ledger` in Supabase. Ping Platform Dev for the schema if useful.

## 2 · MVP framing shifted today — editing-only launch

Paul decided today (2026-07-30) to ship the editing studio (Alex/Sam/Jordan) as the MVP rather than wait for the full manuscript-to-launch platform. Ghostwriter, Design, Publishing, Marketing tabs will follow as staggered releases — each its own product launch beat.

**Pricing implications:**

- **MVP tier needs to make sense on editing-only value.** The full-platform pricing plan may not translate — an author paying for editing-only is buying a different thing than an author buying the whole journey.
- **Cohort question:** how do early editing-only subscribers migrate to bundle pricing when Ghostwriter / Design / Publishing / Marketing release? Grandfathered? Auto-upgrade? Locked into MVP tier until they opt in?
- **Release cadence storytelling:** each station release is a marketing moment AND a pricing moment. Do we announce new tiers with each release, or does the tier structure exist from day one with features "coming soon"?

## 3 · Cover generation quota is explicitly a pricing lever

The Taylor Design & Publishing station specced today: DALL-E cover generation runs will be a tier differentiator (professional gets more, starter gets fewer). Numbers deliberately undecided at their level — the *machinery* is built (`cover_assets` table stores execution IDs, count-per-manuscript trivial to derive), but the actual quota and how it maps to plan tiers is a Financial Model call.

Per-run cost: DALL-E 3 at standard quality is ~$0.04 per image; the workflow now generates 3 per run = ~$0.12 per generation run. A "generation quota" of e.g. 10 runs = $1.20 in DALL-E costs alone. Composer UI is being built to let authors iterate on covers freely once artwork is captured, so runs may be less frequent than initially assumed.

## 4 · Publisher-collaboration model is a new revenue axis

Founding architectural decision this week: authors can invite named publishers into the Design, Publishing, Marketing tabs of specific books (never into the sacred writing space). This creates a **publisher user type** distinct from author user type — publishers get a global dashboard of their authors.

**Pricing implications:**

- **Publisher tier needs to exist.** Per-author-managed? Per-book? Flat monthly? Enterprise contract? Unknown, but the technical infra is being built to support any of these.
- **Author's cost model** — invited publishers use resources on the author's project. Whose bill? Author pays, publisher pays, both?
- **Enterprise angle** — a small imprint (like Jacky's) with 20-50 authors is a very different sale than 20-50 individual authors. Bulk pricing? Custom contracts? This is real revenue potential worth modelling.

Not blocking — publisher-collaboration UI hasn't shipped yet — but the pricing model needs a shape by the time it does (aiming for Sept-Oct release for the demo).

## 5 · Riley (persistent companion) has ongoing per-user LLM cost

Named strategic direction: Riley is an always-available companion, present in the header on every page, holds memory of the author's whole journey via an activity log every agent writes to. This is a **new class of ongoing LLM cost** — not tied to a specific editing pass, but to the author existing on the platform.

**Pricing implications:**

- **Cost per active user goes up** materially once Riley ships. Even light usage = LLM calls per session.
- **Storage cost grows** — activity log entries per user per day, indefinitely.
- **Value framing** — Riley is arguably the highest-perceived-value feature (a real writing collaborator, not a tool). Paul's positioning line: "writing is a lonely profession — a collaborator who remembers you matters." Willingness-to-pay for this feature likely exceeds willingness-to-pay for editing features because it's emotional, not functional.

Riley is not in MVP. But the pricing plan should have a slot for when she ships.

## 6 · Storage grows unbounded per user

Two policies decided this week:

- **`cover_versions` — keep every version, no cap, no pruning.** Every author who iterates heavily on covers accumulates versions forever.
- **`manuscript_versions` (existing)** — approved snapshots per phase, indefinitely.
- **Chat history** — every interaction with every editor, indefinitely (per Clarence Legal drafts).

**Pricing implications:**

- Storage cost is a *slow leak*, not a spike, but real over years.
- Might need a max-manuscript-count-per-tier limit (e.g. starter = 1 active manuscript, professional = unlimited).
- Or a "cold storage" cutoff for completed manuscripts (moved to Glacier-tier storage after N months).
- Or accept it as a marketing feature: "your work is preserved forever."

Not urgent. Worth noting.

## 7 · Free-analysis funnel exists as an acquisition surface

The workflow `Free Manuscript Analysis` on n8n (`Olsiw2AeYhsGIgv5`) is a lead-gen path — a stranger can submit a manuscript and get a free assessment. Currently inactive in production per notes in `n8n-config.ts`, but it's built.

**Pricing implications:**

- Free tier / trial mechanics — is there a free tier of the actual product, or is free-analysis the only free interaction?
- Conversion economics — what % of free-analysis users become paying users? Marketing chat will produce this data over time.
- Cost per free lead — every free analysis burns Alex tokens; per-lead cost is real.

## 8 · Real subprocessor cost baseline (from Clarence brief §4)

For CoGS modelling, current subprocessors on the AuthorsLab bill:

- Anthropic (Claude Sonnet / Opus / Haiku) — biggest LLM spend
- OpenAI (DALL-E 3 for covers) — modest, pay-per-image
- Supabase (Postgres + Storage) — flat monthly, scales with usage
- Vercel (app hosting + analytics) — flat monthly
- n8n Cloud — flat monthly, workflow-count limits
- Stripe — % of transaction
- APITemplate.io — pay-per-PDF, PDF generation for reports
- ConvertAPI — pay-per-conversion, HTML→DOCX for final manuscript
- Resend — transactional email, pay-per-email
- Cloudflare — flat monthly

The LMO ledger captures Anthropic + OpenAI in detail. The others are flat/known.

## 9 · Investor conversation dimension

Paul flagged that pricing needs to hold up under investor scrutiny at the September Jacky demo (or afterward). The Financial Model chat should have ready:

- Per-user CoGS at launch scale, at 100 users, at 1000 users, at 10k users
- Gross margin at each tier
- CAC assumptions (Marketing chat will produce channel-level data as tests run)
- LTV assumptions per tier
- Revenue retention math (how long does the average author stay?)
- Publisher-tier revenue potential (Jacky's imprint = 20-50 authors — what does that contract look like?)

Marketing chat is building the acquisition-machine narrative in parallel. Financial Model + Marketing outputs will need to reconcile before the demo — same story, same numbers.

## 10 · Coordination

- **Platform Dev** — can pull real ledger data any time you want cost queries run. Can also add instrumentation for anything pricing decisions need to measure.
- **Marketing** — will produce CAC data as tests run; needs pricing tiers to work backwards from target CAC.
- **Taylor D&P** — needs the cover-generation quota decision to gate 5.2 runs. Not urgent (composer still being built), but needed before public launch of Design tab.
- **Ghostwriter Station** — needs to know Riley's cost budget before scoping her frequency (how often does Riley proactively check in? Every session? Every day?). Pricing decision.
- **Demo & Content Ops** — the investor-facing pricing narrative feeds directly into the Jacky demo prep.

## 11 · What Platform Dev doesn't need from Financial Model right now

Just to keep the conversation focused — nothing on this list needs a technical change from us today. Pricing plan changes don't require code changes to ship (subscription tiers are wired to Stripe already; adjusting tier definitions and prices is configuration, not deployment). When you need feature-gating enforced (e.g. "starter tier locked out of Ghostwriter tab"), we'll wire it via feature flags at that time.

— Platform Developer station
