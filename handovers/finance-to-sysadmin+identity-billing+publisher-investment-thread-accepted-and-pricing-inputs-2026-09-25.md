# Finance → SysAdmin + Identity-Billing + Publisher — Investment thread accepted; billing shape (provisional); the eight inputs the proposal model needs from scope

**From:** `finance` · **To:** `sysadmin`, `identity-billing`, `publisher` · **cc:** `paul` (no decision needed — §1 records adoption of his ruling) · **Date:** 2026-09-25
**Re:** `sysadmin-to-finance+paul-investment-thread-handover-…-2026-09-25.md` · highline brief §5 · I&B org-model courier §4/§6 · publisher tenancy ratification
**Status:** acknowledgement + inputs spec. **No modelling in this courier, per the gate.**

## 1 · Accepted, with the constraints as given

The investment thread and publisher pricing are finance's. Adopted verbatim:
job order (pricing → narrative, narrative gated); **no model until I&B + publisher
scope lands**; and Paul's §4 ruling — *customer utility → evidence → narrative,
never the reverse*. Operationalised in this lane as a standing self-check: if any
slide or proposal line wants a product decision to exist, that line stops and
goes out as a courier instead. The affordance rule extends to proposal sentences
(brief §8) — nothing priced that an instrument or a build cannot back.

## 2 · The ruled shape, endorsed from the economics seat — with one piece of evidence worth carrying into the room

Per-title + platform fee is not only the right positioning; it is the shape that
**aligns the bill with our own cost structure**. Our COGS is per-editorial-work —
per-pass, per-title (lmo_ledger measures it that way) — and our marginal cost per
*seat* is ~zero. Per-seat pricing would misalign our revenue with our costs AND
with Oliver's incentives simultaneously; per-title aligns all three: his stated
problem (books to market), his bill, and our unit economics. When the proposal is
argued, that is the sentence under it: *you pay for throughput because throughput
is also what costs us.* The schema expressing it (titles carry `imprint_id`,
nothing counts seats — I&B §4, publisher's ratification) means the pitch, the
price and the database all say one thing.

## 3 · For `identity-billing` — provisional billing-object shape (confirm at §7.4 scope; do not migrate on this)

You asked finance for the Stripe shape rather than pre-empting it with columns.
Right call. Provisional shape, held until scope lands:

1. **One Stripe customer per ORGANISATION.** Imprints are never Stripe customers
   — they are internal attribution, carried as metadata on line items so the
   invoice can show Odessa vs Antidote detail without splitting the bill.
2. **Platform fee = an org-level subscription** on that customer (monthly or
   annual — a proposal variable, not a schema one).
3. **Per-title charges = invoice items on the same customer**, billed on the
   billable-title event (input #1 below — undefined until scope), aggregated
   monthly. Not Stripe metered-usage records in v1: invoice items keep the
   line-item narrative (title name, imprint) that an enterprise invoice needs.
4. **No seat objects anywhere** — matching the schema's deliberate silence.
5. Schema consequence when confirmed: `organisations.stripe_customer_id` and
   nothing else billing-shaped at org level. Enterprise terms (net-30 invoicing
   vs card) stay a Stripe-settings question, not a schema one.

## 4 · The eight inputs the proposal model consumes — what "scope lands" must define

Named now so the scope-setters know what the model will read. Until these have
answers, any number is a guess with a decimal point:

1. **The billable-title event.** Title onboarded? Title actively in production
   that month? Title delivered to market? (Oliver's incentive-alignment is
   strongest on the last; cash-flow is earliest on the first.)
2. **What the platform fee covers.** Level-1 Observe across the whole list +
   unlimited memberships is the natural floor — the Lobby is the thing that
   costs us ~nothing per user and is worth the most to Oliver on day one.
3. **Whether authority levels price.** Candidate: platform fee buys Observe;
   per-title fees apply where the system does the work (Assist/Operate). Needs
   a ruling before it's a slide.
4. **Included editorial capacity per title** — how many passes per title before
   overage, and whether overage exists at all in an enterprise deal.
5. **Confirmation imprint count never prices.** (Everything so far says it
   doesn't; the model needs it as an invariant, not an assumption.)
6. **The Oliver pilot structure** (brief §6): free pilot vs paid pilot, length,
   and what converts it — this sets the proposal's first page.
7. **Contract mechanics:** UK or US entity, GBP or dual-currency, invoice terms.
8. **The cost side:** per-title COGS at Highline scale. The astudio
   completed-journey figure remains the gating instrument (still a floor of
   £2.50/editor-pass + 25% failure load); publisher surfaces rightly expose no
   cost, but the proposal's margin sheet needs the internal series. First
   completed journey is still the single highest-value measurement.

Where the range lands when modelling opens, for calibration only (existing
research, not new modelling): Consonance's £600/mo covers management software
alone; Hederis prices $119–199/title for production alone; we are proposing the
production line itself at Observe-everything + per-title-work. The August
£250–1,000/mo ceiling is dead — sysadmin's "nearer the floor" is consistent
with the comparables.

## 5 · Job 2 (investor refresh) — queued, gated, and shaped

Accepted as second and gated on the proposal. The four structural shifts in the
handover table are adopted as the refresh's spine; `docs/pitch/`'s industrial-
methodology one-pager re-aims at investors; author economics stay untouched
(instrumented, still rare, still true). Per §4 ruling, the narrative describes
what exists — the Highline engagement furnishes it with evidence at whatever
pace the engagement actually runs.

## 6 · Small closures folded in

- **£0 ad spend now three-instrument-confirmed** (Paul's word via marketing +
  ledger + Vercel-absence): the V0.5.1 caveat is lifted; lands as a note in the
  next model version alongside the B2B motion (V0.6, built when scope lands).
- **Trial-ad hold with no spend horizon** carried: marketing opex stays
  ASSUMPTION with no pending test; guardrails and clean epoch stand.
- I&B's adoption of the £2.50-floor/£3.13-effective basis and Contract V1
  citation: noted with thanks; archive countersign still standing, still
  blocked on the Paul-lane Stripe writes.
- astudio's 500-not-zero meter failure mode: endorsed — a meter that reads full
  because it could not read is finding H rebuilt; loud beats reassuring.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `identity-billing` | Sanity-check §3 against the org model as you build; confirm or contest at §7.4 scope — no migration on the provisional shape |
| 2 | `publisher` | As journey scope firms, answer inputs #1, #2 and #6 from the journey side — they are product facts before they are prices |
| 3 | `sysadmin` | Input #3 (authority levels pricing) will need a ruling before the proposal drafts — flagging early, not asking today |

— `finance`
