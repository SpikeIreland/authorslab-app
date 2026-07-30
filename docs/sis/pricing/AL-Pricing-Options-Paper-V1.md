# AuthorsLab Price Architecture — Options Paper V1

**AL-PC-OPT-001 · 2026-07-28 · AL Pricing Chat · For decision: Paul**
Inputs: AL-SIS-PRR-001 (market research) · AL-PC-PBR-001 (prosumer bracket) ·
AL-PC-FM-001 V0.1 (financial model). All modelled figures below run every
option through **identical** funnel, churn and COGS assumptions from the V0.1
skeleton — so differences are architecture effects only. The model cannot see
price elasticity; where an option's realism depends on it, that is flagged.
Van Westendorp on the beta cohort + waiting list is the instrument that
closes elasticity, as lmo_ledger closes cost.

## PD-1 · Tier count and price points (the headline decision)

| Option | Shape | M12 MRR | M36 MRR | M36 writers | M36 GM% | 36-mo cum EBITDA |
|---|---|---|---|---|---|---|
| **A** | 3 tiers £10 / £19 / £39 monthly; annual eff £7 / £13 / £27 (~30% disc) | £2,770 | £27,128 | 1,573 | 54.6% | −£178k |
| **B** | 3 tiers £12 / £24 / £45 monthly; annual eff £7 / £13 / £25 (~45% disc) | £3,079 | £30,791 | 1,573 | 58.7% | −£142k |
| **C** | 2 tiers £19 / £39 (no Starter); ~30% disc | £3,541 | £36,904 | 1,704 | 49.9% | −£145k |

**Reading the table honestly.** B beats A on every line *only because its
prices are higher at unchanged conversion* — the model is blind to the
customers a £24 sticker loses. C's MRR lead is similarly flattered twice:
identical conversion despite no cheap entry (the bimodal market's 44%
≤$100/mo earners have nowhere to land), and its writer count is higher only
because the high-churn Starter tier no longer exists to churn. C also has
the **worst** gross margin — its subscriber mix carries more deep-pass
allowance per head (avg 5.5 passes vs A's 3.7).

**Recommendation: Option A shape, with B held as the Van Westendorp test
case.** A keeps the £19 flagship anchor (Paul's instinct, validated in-range
twice), keeps a Starter answer to the bimodal bottom, and its £19-monthly /
£13-annual-effective flagship sits dead-centre in bracket norms
(AL-PC-PBR-001 §3.2). Put B's £24 anchor into the Van Westendorp questionnaire
— if the cohort tolerates it, B is a straight upgrade; deciding that from a
model that can't see elasticity would be guessing.

## PD-2 · Billing basis and annual discount depth

The bracket's universal pattern is a high monthly anchor with a 60–67%
annual discount (PWA $360→$120; Grammarly $360→$144). The stress frame's
~30% discounts are shallow by comparison. Modelled: shifting annual take-up
from 40% to 25% *raises* revenue under both A and B (monthly payers pay
more), but annual prepay is what funds CAC and suppresses churn — the model
does not yet reward either effect (V0.2 should link churn to billing period).

**Recommendation:** advertise the annual price as the headline (the bracket
does), state "£13/mo billed annually · £19 billed monthly" — never a bare
"£19" — and treat discount depth (30% vs 45%) as a Van Westendorp question,
not a modelling question.

## PD-3 · Analysis-credit allowances (gated on lmo_ledger)

Provisional: Starter 1 / Author 4 / Pro 10 deep passes per month, 60%
assumed utilisation. Benchmark: PWA sells Chapter Critique at 1/day for
$10–30 — nominally far more generous, but *its* unit cost is invisible while
ours is about to be measured. The sensitivity that matters: **at £3/pass
(placeholder) Option A runs 54.6% gross margin; at £6/pass it collapses to
20.8%** and cumulative EBITDA worsens by £117k. Allowance sizing is therefore
an instrument reading, not a taste decision.

**Recommendation:** decide tier *structure* now, hold allowance *numbers*
open until the first month of lmo_ledger aggregates lands, then size
allowances so flagship gross margin clears 70% at measured cost. If a full
five-station pass proves expensive, meter by station-pass rather than
full-journey pass — the ledger records per-station, so the product can
price per-station.

## PD-4 · One-time pass (the funnel product)

The verified one-time band is $59.99–$147 (Scrivener–Atticus; Vellum $249.99
above it). The current $299 sits at 2× Atticus. As a *funnel* product its
job is conversion, not margin.

**Recommendation:** reprice to **£119 (~$150)** — top of band, defensible on
journey scope — and credit the pass against the first subscription month if
the buyer upgrades within 90 days. Keep free full-manuscript analysis as
top-of-funnel (unchanged). The $2k–$10k human-services anchor stays on the
site (per founding brief §4.4).

## PD-5 · Grandfathering the 11 beta authors

Cursor's 2025 repricing burned loyal users by moving the meter without
grandfathering — the research's one named cautionary tale. Options: (i) free
for 12 months then full price; (ii) 50% of Author for life; (iii) free 6
months then 50% for 12. Modelled difference between them over 36 months is
< £2k — **this decision is reputational, not financial.**

**Recommendation:** option (ii) — "Founding Author" status, Author tier at
£9.50/mo for as long as the subscription stays active, announced *before*
the pricing page changes, with their current one-time entitlements honoured
in full. Cheap forever, and it converts the transition cohort into
references for the September deck.

## PD-6 · Imprint SKU shape (frame now, decide in September)

Not decidable before the Jacky Klein conversation — the open question from
AL-SIS-PRR-001 §7 ("per-seat, per-title, or list pricing?") belongs to them.
Frame to carry in: per-title (Hederis pattern, $119–199/title, bundling
down at volume) suits list-driven imprints; seats-with-minimum (Consonance,
£75/seat × 8 min) suits team-driven ones. Floor stance: the conversation
prices against **Consonance's £600/mo**, entered at £500/mo placeholder in
the model; do not open below £250 (bottom of researched range). Imprint COGS
line is INSTRUMENT-PENDING until a first imprint runs real manuscripts.

## Decision sheet

| # | Decision | Recommendation | Paul's call |
|---|---|---|---|
| PD-1 | Tier count & points | A: £10/£19/£39, Starter retained; test B's £24 anchor in Van Westendorp | ☐ |
| PD-2 | Billing display & discount | Annual-first display; discount depth 30% now, test 45% | ☐ |
| PD-3 | Credit allowances | Structure now (1/4/10 provisional); numbers after first lmo_ledger month, sized to ≥70% GM | ☐ |
| PD-4 | One-time pass | £119, credits toward first sub month within 90 days | ☐ |
| PD-5 | Grandfathering | Founding Author: £9.50/mo for life of subscription, announced pre-change | ☐ |
| PD-6 | Imprint SKU | Frame per-title vs per-seat; decide with Jacky Klein; floor £250, target vs £600 | ☐ |

**Sequencing note.** PD-1/PD-2 gate the website messaging delta and the
deck; PD-3 gates nothing until the ledger reads; PD-5 should be announced
before any public pricing change; PD-6 waits for September by design.

*Method note: modelled figures from a Python replication of AL-PC-FM-001
V0.1 formulas (verified equal to the workbook's recalculated output for the
baseline). Elasticity unmodelled — flagged wherever it bites.*
