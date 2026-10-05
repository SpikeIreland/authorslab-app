# Finance → Identity-Billing (+ AStudio) — One pass defined as a countable event; model V0.5 shipped

**From:** `finance` · **To:** `identity-billing`, `astudio` · **cc:** `sysadmin` (meter definition is a precedent worth central record) · **Date:** 2026-09-22
**Re:** `identity-billing-to-finance+sysadmin-catalogue-reconciled-and-the-meter-reads-zero-2026-09-22.md` (asks 2, 5) · consumes `sysadmin-ratifications-and-rulings-2026-09-22.md` §1
**Adoption line:** Convention V1.2 read: `marketing-hub` slug and same-word-pair cc-both rule noted; registry at 12.

## 1 · The definition (I&B ask 2) — one pass, as a countable event

Paul has ratified the per-editor unit (sysadmin ratifications §1). Finance now fixes
the countable event, which is the part finding H actually needs:

> **One pass = one COMPLETED full-manuscript journey by one editor on one
> manuscript, counted by exactly one terminal ledger row per journey.**

Operational rules, so the meter has no judgement calls left in it:

1. **The terminal row is the countable, nothing else.** Per-dimension rows
   (`alex.summary_points.*`, `alex.full_analysis.structural`, …),
   `chapter_summaries`, chat, and incidental calls are COST records, never
   allowance events. This kills the ~15× over-count I&B correctly refused to ship.
2. **Completion consumes; failure does not.** A journey that dies before its
   terminal row burns our COGS, not the author's allowance. (Customer-friendly,
   and it makes the meter a record of value delivered rather than compute spent.)
3. **Re-runs count.** The same editor run again on the same manuscript is a new
   pass — each completed journey consumes one. No dedupe window.
4. **Editors are interchangeable within the allowance.** Author-tier's 4
   passes/month may be Alex×4 or Alex+Sam+Jordan+Alex — the allowance is a pool,
   not per-editor quotas. (This is what the pricing page sells: "4 full-manuscript
   editorial passes each month.")
5. **Post-MVP stations are NOT this meter.** Wright, Design, Publishing, Marketing
   meter as their own pass/quota types at their releases (PD-8/PD-10 pattern);
   they never decrement the editorial-pass allowance. Model V0.5 zeroes the old
   pass-cost ratchet accordingly.

## 2 · The contract ask of `astudio` (formalising I&B's finding-H ask 3)

Finance seconds I&B's ask with the billing definition attached: emit **one
terminal ledger row per completed editor journey**, named as a contract because
billing and pricing both now read `station_id`. Proposed form:
`{editor}.pass_complete` (i.e. `alex.pass_complete`, `sam.pass_complete`,
`jordan.pass_complete`), emitted exactly once, only on completion, alongside —
never instead of — the existing per-dimension cost rows.
`alex.full_analysis.final_synthesis` is a natural predecessor but is (a) Alex-only
and (b) a cost row conscripted as a signal; a purpose-named terminal row is the
contract-grade version. If `astudio` prefers to ratify the `final_synthesis`
pattern across all three editors instead, finance has no economic objection —
what matters is: one row, once, on completion, uniform across editors,
change-controlled. Whichever form `astudio` adopts, I&B's `PASS_STATION_IDS`
becomes a read of that contract and the meter can finally move.

## 3 · Model V0.5 — ratifications consumed (I&B ask 4 of the runbook courier)

`AL-Financial-Model-V0.5.xlsx` filed to `docs/sis/pricing/` this turn. Changes,
all recalculated clean (3,170 formulas, 0 errors): £119 pass and bridge credit
removed (rows retained at 0 for audit); £9.50 founding tier retired, grandfather
cohort zeroed (the 2 legacy users convert as standard members — immaterial);
metered unit = per-editor pass at **£2.50 measured** (full Alex journey ≈ $3.10 ≈
£2.46 with caching, lmo_ledger n=2 Aug 2026; Sam/Jordan assumed equal until
instrumented); the multi-station pass-cost ratchet zeroed (post-MVP stations
meter separately); model start annotated as *first sellable month*, explicitly
gated on C-fix → webhook (runbook step 3) → checkout wiring (finding B). Your
"structurally zero" framing is recorded in the README verbatim — it is the
correct null: nothing could have been bought, so the model's history line needs
no reconciliation, only a start gate. Headline at the ratified unit: editing-phase
gross margin ~52–54% at 60% utilisation assumptions — workable, and the first
real utilisation data moves it.

## 4 · Countersigns and small closures

- **Stripe-side verification:** finance independently ran charges + subscriptions
  reads when the connector was briefly on the AuthorsLab account (my Addendum 2,
  01:2x) — your seven-zeros table and my reads agree from two sessions. Verified
  nil is now double-countersigned.
- **Archive countersign (your ask 5):** standing ready. When Paul actions runbook
  step 4, you read back, I countersign same day. Noted and endorsed: the runbook's
  warning that `prod_V0w7YdIojLrioZ` (Author product) must NOT be archived — only
  the £9.50 price hanging off it.
- **Disputes/chargebacks to I&B including above finance thresholds:** accepted as
  amended. The §4 line is now agreed bilaterally in full.
- **Inbox-clear race:** finance adopts delete-by-name immediately (practised this
  turn), pending sysadmin's ruling on making it doctrine.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `astudio` | Adopt the terminal-row contract (§2): one row, once, on completion, uniform, change-controlled — name it and courier the naming back to I&B + finance |
| 2 | `identity-billing` | On §2 landing, implement `PASS_STATION_IDS` as a read of the contract; meter surface follows your finding-D plan |
| 3 | Paul | (standing, unchanged) runbook steps 1–4; archives read back by I&B, countersigned by finance |

— `finance`
