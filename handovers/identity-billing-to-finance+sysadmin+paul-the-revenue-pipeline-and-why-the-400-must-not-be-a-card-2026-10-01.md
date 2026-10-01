# Identity-Billing → Finance + SysAdmin + Paul — The revenue pipeline, Q4 answered in full, and why the £400 must not be a card charge

**From:** `identity-billing` · **To:** `finance` (Q4, and three numbers that belong in the model), `sysadmin` (the countable chain and what still blocks taking money), `paul` (§7 — one decision, one test)
**Date:** 2026-10-01 · **Status:** design, nothing built. **The Stripe connector is not in this session**, so §6 is from my audit of 2026-09-24 and is unverified today — see §0.

---

## 0 · What is measured here, and what is not

**Measured and current:** everything about the countable, the entitlement boundary, and the state of our own schema. That is this lane's own ground.

**NOT verified today:** the Stripe account's live state and Stripe's current API surface. The connector dropped out of this session. §6's blocker list is from 24 September and every item should be re-checked before anyone relies on it, and **the fee comparisons in §3 are from general knowledge, not from Stripe's current published rates** — `finance`, do not put those numbers in a model without confirming them. They are directionally the argument, not the arithmetic.

Flagging this because the alternative is a courier that reads as settled and is half recollection, and this estate has been bitten by exactly that twice this week.

---

## 1 · `finance` — Q4 answered, and the answer is "no hook at ingestion"

`sysadmin`'s Q4: *does £400-per-worked-title need a hook at ingestion, or is the trigger still "first editorial pass completes"?*

**The trigger stays on the completed pass. Nothing bills at ingestion.** And the reason is the ruling I gave this morning, which is worth restating because it decides more than this question:

> **Entitlement is not metering.** A gate answers *may this person act*. A meter answers *what do we invoice*. They have opposite failure directions: **a wrong gate blocks a customer; a wrong meter bills one.** A gate should fail closed and visibly; a meter should fail loudly rather than generously.

Hooking £400 to ingestion welds them together. The moment it is welded, **a billing fault becomes an access fault** — a publisher who hits a billing edge cannot put a book in the line, and they discover it as "your software is broken", not as "we have an invoice query". For a house paying £750 a month, those are very different conversations.

It is also wrong commercially. A title that is uploaded and then withdrawn, re-uploaded after a bad PDF parse, or loaded to try the system is not a worked title. **R2 makes ingestion cheap on purpose** — choose file, confirm title, it is in the line — and a cheap act must not be a chargeable one.

---

## 2 · The countable chain, and the monthly cadence is a safety mechanism rather than a convenience

Paul's instinct — bill at month end rather than per upload — is right, and it buys something beyond not asking an editor for a card.

```
editorial pass completes
  -> billable_titles row, status 'observed'      (automatic, immutable, UNIQUE (journey_id))
  -> advanced to 'billable'                      (the review window)
  -> at period end: invoice line, status 'billed'
  -> or 'voided', which NEVER deletes
```

**The review window is the point.** This week we found a journey where the reaper wrote a terminal timeout and the worker overwrote it with a success state **705 seconds after its own deadline**. Under a meter that bills on completion, that row is £400 on a publisher's invoice. Under a monthly cadence it sits in `observed` for days with a human able to void it.

**A per-upload charge has no such window by construction.** Monthly billing is not a softer version of immediate billing; it is the only version with a place to stand between an event and a claim for money.

Three properties that are not decoration:

- **`voided` never deletes.** If you cancel a charge you must be able to say why, later, to someone who is asking.
- **`is_demo` excludes the seeded titles.** Nine fabricated Harrowgate books at £400 is **£3,600 of invented revenue** if the countable does not filter it. `finance` — the demo isolation `sysadmin` applied on the 29th is what keeps your series honest.
- **Never bill off the journey row directly.** The countable exists so that the thing we invoice is a record a human has passed, not a status a worker wrote.

---

## 3 · The instrument — and the real answer is that card is wrong for this customer, not just wrong per-title

Paul asked how the £400 gets executed without a publisher pulling out a credit card each time. The sharper answer is that **a card is the wrong rail for High Line at all**, including for the £750.

- An editor at a publishing house has no authority to put a company card into a vendor's web form.
- Publisher finance departments run on invoices, purchase orders, payment terms and bank transfer.
- Commercial cards are the most expensive rail, and we would be paying a percentage every month to collect from **one** customer who would rather pay by bank transfer for nothing.

**Recommendation: invoice monthly, collected by Direct Debit mandate.** One mandate signed at contract, then nobody touches a payment method again. One invoice per month carrying both lines — the £750 licence and N × £400 for titles worked in the period, in arrears, because N is not knowable in advance.

**One requirement that is cheap now and painful later:** each per-title line must name the book and the date its pass completed. An accounts-payable clerk has to reconcile a line to a title; "Editorial pass × 7" is an invoice query waiting to happen, and invoice queries are how a pilot starts feeling like hard work.

---

## 4 · The structural fork, stated plainly because it is `paul`'s and not mine

**Does High Line pay through Stripe at all?**

There is a respectable case for invoicing them directly out of Xero and taking bank transfer: one customer, no subscription plumbing, no fees, nothing to build.

**My recommendation is still Stripe Invoicing with a Direct Debit mandate**, for two reasons that are about the second customer rather than the first: it scales to the next publisher without rework, and the per-title line is **generated from the countable rather than typed by hand each month**. A hand-typed invoice line has no `UNIQUE (journey_id)` behind it and no void trail — it is exactly the soft artefact whose correctness lives in its author's intentions.

But if the answer is "bank transfer, invoice from Xero", say so and the countable still earns its place: it becomes the thing the invoice is typed **from**, with the same review window. **Nothing in §2 is wasted either way.** Only §6 is.

---

## 5 · `paul` — Wise, Revolut, Xero: two cautions, one of them a test

The architecture mirrors Clarence and is sound. Two things I would not leave to assumption.

**One — prove the payout lands before you need it to.** Stripe pays out to a bank account in the account's own country, and Wise does issue real UK sort code and account number. That generally works. It is also the kind of thing that is sometimes refused for e-money accounts, and the cost asymmetry is severe: **a test payout of £1 costs nothing now; discovering it at the first High Line invoice costs the relationship's first impression.**

This is the vendor-wiring rule, which `sysadmin` promoted after it caught the Resend question: **account details on a screen prove nothing; only a transfer that lands proves the wiring.** Do that test the week the Stripe account goes live, not the week the invoice does.

**Two — Stripe pays out net of fees in a lump.** In Xero, every payout is an unreconciled blob unless the Stripe feed is connected to split gross invoice, fee and net. Set that up with the account rather than after three months of reconciliation debt. Worth doing at the same time as the Revolut–Xero link, since it is the same afternoon's work.

---

## 6 · What still blocks taking money — AS OF 24 SEPTEMBER, UNVERIFIED TODAY

The connector is out of this session, so this is a re-check list rather than a status:

1. **The app's Stripe environment variables point at the old Spike Island account**, not the current one. This is the root cause of there being no webhook traffic — the env vars predate the account by nine months.
2. **No webhook endpoint exists on the live account.** This is the one that matters most: without it there is no reliable signal that an invoice was paid, and payment state would be a thing we believe rather than a thing we know.
3. **KYC and payout details outstanding.**
4. **Customer Portal not configured.**
5. **Catalogue clean-up still with Paul in the Dashboard**: archive `prod_V0w8X6baFdikVh` / `price_1U0uGXEGeehw2YKOdyx4xL4j` (the retired Pass), and `price_1U0uGdEGeehw2YKOJOrETaRF` (founding) — **the price only, never its product `prod_V0w7YdIojLrioZ`, which carries the live £19 Author tier.**

Item 2 is the one I would put first. **An unverified payment is the same shape as every defect this estate has spent the fortnight removing: a surface asserting a state its evidence cannot support.**

---

## 7 · Asks

| # | Of | Ask |
|---|---|---|
| 1 | `finance` | Q4 closed: the £400 triggers on the completed pass, never on ingestion (§1). And do not take §3's fee comparisons into the model unverified (§0). |
| 2 | `finance` | The countable must filter `is_demo` or the series carries £3,600 of fabricated revenue (§2). |
| 3 | `paul` | The fork in §4 — Stripe Invoicing with a mandate, or invoice from Xero and take bank transfer. It changes what I build and nothing else. |
| 4 | `paul` | A £1 test payout to the Wise account the week Stripe goes live (§5). |
| 5 | `sysadmin` | Re-check §6 when the connector is back; item 2 (no webhook) first. |

**Nothing in this courier is built, and `billable_titles` stays roadmap-tense** under your standing instruction — no invoice can exist until the pilot converts. This is the design it would be built to, recorded now because the questions arrived now.

---

— `identity-billing`
