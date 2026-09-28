# High Line Pricing Scenarios — for Paul's ratification

**AL-PC-HL-001 · 2026-09-28 · finance** · Feeds proposal §4.6 once ratified. **Not for any customer document until (a) Paul ratifies a scenario and (b) the three build gates clear.** Frame already ratified (platform fee + per-title on first station completion, GBP). Every figure carries its basis: SOURCE (verified comparable), INSTRUMENT (measured), or SYNTHESIS (finance judgement for ratification).

## 1 · The grounding

| Anchor | Figure | Basis |
|---|---|---|
| Consonance — publisher management SaaS, UK | £600/mo floor (8 seats × £75 + £2,500 setup) | SOURCE, verified 2026-07-28 |
| Hederis — per-title production tooling | $119–199/title (~£95–160) | SOURCE, verified 2026-07-28 |
| Human editorial, per book | £1,600–£8,000+ ($2k–$10k+) | SOURCE, verified 2026-07-28 |
| Our per-title editorial COGS (3 editors, full line) | ~£9.40 effective (3 × £2.50 FLOOR × 1.25 failure load) — call it £10–30 allowing re-runs at Assist level | INSTRUMENT-floor + ASSUMPTION load; first completed journey reprices |
| High Line scale | 2 imprints, first list commissioned, first books spring 2027; 20–50 author list (sizing from the Sept meetings) | SOURCE (meeting record) |

Read of the anchors: Consonance sells *management* for £600/mo with seat caps; Hederis sells *one production stage* per title. We sell the whole line's instrument plus the editorial work itself. Above Consonance on the fee and above Hederis on the title is defensible; multiples of either needs evidence we don't yet have.

## 2 · The scenarios (all GBP; pilot free in all three, converting on first completed journey)

| | A · Conservative | **B · Anchor (recommended)** | C · Premium |
|---|---|---|---|
| Platform fee (Observe everything; unlimited seats + imprints) | £500/mo | **£750/mo** | £1,000/mo |
| Per-title (the full editorial line for that title, once) | £250 | **£400** | £600 |
| Year 1 illustration — 15 titles worked | £10.75k | **£15k** | £21k |
| Steady state — 30 titles/yr | £13.5k | **£21k** | £30k |
| Per-title gross margin at measured floor | ≥90% | **≥92%** | ≥95% |

**What the per-title fee includes (this is also the answer to open input #4, proposed for ratification):** the title's complete editorial line — one completed journey per editor (Alex, Sam, Jordan) — at whatever authority level the customer has set. Re-runs beyond that are included within fair use in v1; no overage meter in the first contract. One line on the invoice per book, no asterisks — Paul's "easy decision" objective applied to the smallest unit.

## 3 · Why B

- **£750/mo sits credibly above Consonance's £600** — we show the line, not just manage metadata — without doubling a number Oliver can benchmark in one phone call. It reads as "priced like the category, better than the category."
- **£400/title is 5–25% of ONE human editorial pass** on the same book, and ~2.5× Hederis's fee for a single production stage. The sentence in the room: *the full editorial line, per book, for a tenth of what one human edit costs.* It is also ~40× our measured floor cost — margin that survives the floor being wrong by a factor of five.
- **The totals pass the ledger test** (Paul's argument): £400 against a title P&L that already carries thousands in editorial/production is a small line next to the value; £15–21k/yr against the £60k+ of human editorial a 30-title list would consume is an easy corporate yes, and big enough to be taken seriously.
- A: safe but leaves the category signal weak (£500 under Consonance says "lighter than management software," which is the wrong message). C: defensible on value but hands Oliver a benchmarking objection in the first meeting; better reached by PD-7-style steps after the pilot proves throughput.

## 4 · What ratifying B commits us to — and what it doesn't

It sets the OPENING numbers for the High Line proposal only. It does not set a rate card for publisher two (each org contract is negotiated; the frame is the constant). It does not bind author-side pricing (untouched). And per the standing rules: these numbers appear nowhere Oliver can see them until the gates clear and the proposal passes its verification pass — Paul and Carl own the send.

— `finance`

---

## ADDENDUM — the "we have our own editors" case (Paul's stress test, 2026-09-28)

**The scenario:** High Line runs its own human editors and never hands a book to our
editorial line. Under the ratified frame this is a DEFINED case, not a gap:

- **Oliver pays the platform fee only.** Level 1 (Observe — "change nothing about
  the work; record what was done") tracks his human editors' station completions,
  so the Lobby still answers *which book is going to slip* across both imprints.
  His worst case is a ~£9k/yr observability bill (scenario B), zero editorial
  control ceded, zero per-book charges for his own staff's work.
- **This is the risk-mitigation answer AND the adoption wedge:** the instrument
  shows him which books are stuck; handing the overflow or backlist titles to our
  line becomes a decision his own dashboard argues for. Mixed mode (his editors on
  lead titles, our line on the rest) is the expected steady state.
- **Our economics in this case:** Observe-only revenue is fee-only at near-total
  margin (the Lobby is database reads). The deal's cost exposure is structurally
  low anyway — measured/vendor intensity ranks: Wright/drafting (heaviest by
  construction, output-token-dominated, uninstrumented, separately metered per
  PD-10, and NOT in this contract) → editing (measured: £2.50/journey floor,
  £10–30/title effective, caching cuts input 90%) → covers ~£0.10/run → format
  conversion pennies/doc → chat/Observe ~free. The publisher deal sits on our
  cheapest cost base; the pricing risk is fee-revenue concentration, not margin —
  which is why the platform fee must stand alone against Consonance's £600/mo,
  and does.

**PRECISION REQUIRED before the proposal drafts (flagged to sysadmin, publisher,
I&B):** the billable trigger "first completed editorial station" must be stated
everywhere as **first SYSTEM-completed station (level ≥2)**. A station marked done
by a human at level 1 records and never bills. The input #3 ruling (level boundary
= billing boundary) implies this; the proposal and the countable's schema must
make it explicit — the countable should be writable only by the system's own
completion path, never by a human station mark.

— `finance`

---

## ADDENDUM 2 — SCENARIO B RATIFIED (2026-09-28)

Paul ratified **scenario B** in-channel this date: £750/mo platform + £400/title, per-title includes the title's full editorial line once (one completed journey per editor) with fair-use re-runs, no overage meter in v1; pilot free, two titles, converting on first completed journey. Input #4 subsequently RULED by finance inside the ratified frame: **the per-title fee buys the title's entry to the line, not a bundle of passes** — no proration for partial use, and the proposal's §4.6 must state this out loud (publisher's 2026-09-28 condition, adopted). Courier-resident record: `handovers/finance-to-publisher+identity-billing+sysadmin-scenario-b-ratified-and-the-fee-buys-entry-to-the-line-2026-09-28.md`. Standing rule unchanged: no figure reaches a customer surface until the three gates clear and the verification pass runs; Paul and Carl own the send.
