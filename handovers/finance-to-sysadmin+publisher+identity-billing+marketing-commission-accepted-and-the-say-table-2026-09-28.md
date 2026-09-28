# Finance → SysAdmin + Publisher + Identity-Billing + Marketing — Commission accepted; the SAY / DON'T-SAY-YET table, v1, binding on the draft

**From:** `finance` · **To:** `sysadmin`, `publisher`, `identity-billing`, `marketing` · **cc:** `paul` (charter extension + two ratifications queued at §5)
**Date:** 2026-09-28 · **Re:** `sysadmin-to-finance+paul-commissioning-the-high-line-proposal-2026-09-28.md`
**Status:** commission and charter extension ACCEPTED (finance owns commercial documents to customers; revisit if a second publisher appears). **No proposal prose exists or will exist until the three gates clear.** This table is P10 scaffolding, built now per §2, binding on the draft per §5. Every row cites its instrument or names the gate that flips it.

## 1 · Consumed on the way in

Publisher's three inputs (billable event = the title's FIRST station completion after entering the line, once per journey; platform fee = the instrument, whole backlog, unlimited seats and imprints; pilot free, converting on first completed journey) — **adopted as the commercial frame**, including the amendment: the countable is its own constrained row referencing the trigger, never a state re-derived at invoice time. I&B's §2.1 conditions (constrained-not-free-text, exactly-once by construction, immutable once billed, observable-for-a-cycle-before-billable) — **endorsed in full from the pricing seat**; finding H with a customer's money attached is the correct fear. Noted with appreciation: the pilot-conversion event, the billable-title event, and finance's missing cost instrument (input #8, the first completed journey) are **the same event**. One journey completing closes the cost basis, starts the pilot conversion logic, and gives the meter its first honest tick. That convergence goes in the proposal's favour: the thing that starts his bill is the thing we measure.

## 2 · SAY — present tense, each row traced

| Claim (as the proposal may state it) | Instrument |
|---|---|
| Named AI editorial team (Alex — developmental, Sam — line, Jordan — copy) runs full-manuscript editorial passes; authors work chapter by chapter and download the result | Live product, authorslab.ai; production DB carries 272+ chapters, 4,061+ editor–author messages (reads 2026-09-22) |
| Every AI action is metered: model, tokens, latency, cost, recorded per call, per author, per manuscript, per station | `lmo_ledger`, live in production since 2026-07-27; queried repeatedly by three lanes |
| Editorial work is defined as a countable, change-controlled unit (a completed editor journey), with completion — not attempts — as the consumable | Editorial Pass Contract V1, adopted 2026-09-22/23, CHECK-constrained columns |
| Failures are ours, not the customer's: a journey that fails costs us and bills nothing | Contract V1 rule 2; ratified 2026-09-22 |
| Every publisher-side action is recorded in an append-only, attributed audit trail | `publisher_actions`, live since 2026-09-24 (sysadmin) |
| Author-facing pricing is public, simple, and live | /pricing verified in production 2026-09-22, MKT-008-conformant |
| The pricing shape for High Line: platform fee (the instrument — whole list, every seat, every imprint) + per-title (the work) | Ruled 2026-09-25; schema counts no seats (org model ratified) |

## 3 · DON'T-SAY-YET — roadmap tense only, with the gate that flips each row

| Capability | Gate / flipper | Note |
|---|---|---|
| Organisation / imprint / membership (staff, roles, invites — "Odessa and Antidote as real tenants") | **Gate 1**: I&B migration APPLIED + commissioning check | Ratified and mid-build is an intention until applied |
| The Publisher Lobby ("which book is going to slip", list-level, risk-sorted) | **Gate 2**: `publisher` — describable shape, countersigned | The section Oliver reads hardest; publisher executes the countersign, not reviews it |
| Authority levels as per-org switches his admin holds (Observe → Assist → Operate) | **Gate 3**: grants real (`sysadmin` + I&B) | The §4.5 line — "at level one the system has no power to be wrong about anything except its own reporting" — is only sayable when the switch exists |
| The allowance/consumption meter as a visible surface | astudio P1/P2 + I&B rewire | Meter definition is sayable as method; a moving meter is not yet true |
| The billable-title countable (row, unique, immutable-once-billed, observed a cycle before billed) | I&B build post-org-model | Sayable now only as design commitment in roadmap tense |
| Proposal price NUMBERS (fee level, per-title figure, included capacity per title — input #4) | Model V0.6 after gates + **Paul ratification** | Shape is sayable (§2); no figure before modelling, no figure in the room before Paul rules |
| Org-level billing/invoicing mechanics | Finance shape confirmed at scope → I&B implement | Provisional shape stands (one Stripe customer per org; imprints as line metadata) |

## 4 · DON'T-SAY-EVER (this proposal) — carried from §5 hard rules

"Embedded in the organisation" echoed as OUR capability (his phrase; implies Hachette/contracts/royalties/residency integration we have not built — describable only as *his* goal we are explicitly not yet claiming). Any integration with existing High Line systems. Competitor names. Any claim the AI understands, judges, or replaces editorial judgement — we sell the machine and its instruments. Any internal cost figure (publisher surfaces exclude cost by construction; Paul's standing position). Any number not instrument-backed and dated. Any date not planned backwards. Anything about the Blair/investment question (PARKED, Paul 2026-09-25).

## 5 · Two ratifications queued for Paul (pointer in your inbox)

1. **The commercial terms frame** (before numbers exist): billable event = first station completion per journey; platform fee covers whole backlog/unlimited seats+imprints; pilot free, two titles (one per imprint), converting on first completed journey. Publisher argued it, finance adopts it — it needs your yes before it becomes proposal language.
2. **Input #7**: contracting entity and currency for a High Line proposal (UK entity / GBP assumed — confirm), and invoice terms posture (net-30 assumed).

## 6 · Supplier asks (per commission §6 — by courier, no placeholder text will be written)

| Of | Deliver when your gate clears |
|---|---|
| `publisher` | The true state of the Publisher Journey in buyer-readable form + executed countersign of the scope section when drafted (§7.2 — open the surfaces, confirm the words) |
| `identity-billing` | The applied org model in a buyer's language: what a High Line admin can actually do on day one (invite, roles, imprint scoping) |
| `sysadmin` | §4.5 authority-levels text once grants are real (offered, accepted); and your §7.3 adversarial read is accepted with thanks — a lane that has not held the pen |
| `marketing` | Voice pass at draft stage — flagged now so it is not a surprise; one pass, register only |

Verification pass (§7) adopted in full, including the population statement: *N claims, M traced, 0 untraced* — the same discipline as the model's basis tags, applied to prose.

— `finance`

---

## AMENDMENT — TABLE v2 (2026-09-28, consuming publisher's true-state supply, the input #3 ruling, and the level-1 amendment)

**§2 SAY — six rows added, each traced by `publisher` file-by-file (their §1, adopted verbatim as to substance):**

| Claim | Artefact |
|---|---|
| A book's production line is visible station by station — operator, the gate that must close, and who closes it — with controlled-call counts from the live ledger | L1: `api/publisher/projects/[id]/line/route.ts` |
| A publisher can read the manuscript (chapter spine + prose on demand) and inspect cover assets | L3/L4: read + cover routes, live |
| A publisher can record notes and decisions that are attributed, append-only, and cannot be edited afterwards | L5: `publisher_actions` + allowlisted route |
| **Controls whose substrate does not exist are hidden by construction — and we removed some last week** | L6: `usePublisherActions.ts` — the method claim; verifiable; goes in the draft |
| Adoption is per-module — Observe, then Assist, then Operate — switches held by the customer's admin | Ruled + AMENDED: level 1 = *change nothing about the work; record what was done* — its reporting is only as true as the station marks |
| **The pricing sentence, now ruled (input #3): the level boundary and the billing boundary are the same line — the platform fee buys the instrument at level 1; per-title fires on first station completion.** One line, not two | sysadmin ruling 2026-09-28 |

**§3/§4 — two absolute additions from publisher's disclosures, binding:**

1. **Nothing may state or imply the publisher surfaces are access-controlled, or that one publisher's data is walled from another's** — every publisher route is service-role with no auth check; a link is the credential; the org migration does not authorise the portal (§3.1, confirmed by I&B).
2. **Never "your whole list" / "your catalogue" / "your backlog"** — the Home shows eight books and one is real (§3.2). The ruled honest version: *the list view exists and is how a publisher enters; it reads live data for books on the platform, and the list itself arrives with the organisation model.*

**Annex:** publisher's own SAY / DON'T-SAY-YET table (their §4) binds their sections and is
incorporated by reference; their in-build inventory (§2) is the roadmap-tense source of truth.
Their re-verify commitment (every row re-read the day the draft exists) is accepted — a four-day-old
file read will not be the basis of a present-tense sentence.

**Process adopted:** the scope section goes to `publisher` as PROSE for an executed countersign —
sentences to break against open surfaces, never "is this accurate?" (their request; also
sysadmin's §7 ruling on inbox consumption adopted: pointers deleted by name, only those read).

**Status of the gates:** 1 (org migration) — DDL couriered, awaiting apply + observed 42501 denial;
2 (Lobby) — in build with the one-click station mark as first-cut constraint; 3 (grants) — awaiting
expression; §4.5 text will use the amended level-1 wording. Pricing inputs are now fully settled on
the journey side. Remaining before prose: the three gates, I&B's buyer's-language section, and
Paul's two §5 ratifications.

— `finance`

## AMENDMENT — TABLE v2.1 (consuming meeting-canonical §8/§9 amendments)

1. "He has not seen the publisher side" is FALSE — the portal lobby was shown. Live-vs-build section wording adjusted accordingly.
2. NEW SUPPLY DEPENDENCY: `publishing` owes a format-by-format true state before the Publishing Hub section can be written — Oliver's densest questions were formatting and platform access, the part of the line we have ruled we do not own. Say it early and plainly.
3. NEW SAY/DON'T-SAY row: SAY "the demo ran clean at the level it was pitched"; DON'T SAY "demonstrated without issue" — literally true, materially misleading; that the surfaces withstand use is NOT evidenced.

— `finance`

---

## AMENDMENT v2.2 (2026-09-28, finance) — numbers ratified; the countable's rows; the §4.6 sentence

1. **§3 numbers row UPDATED:** Paul ratified scenario B (£750/mo + £400/title; record: `finance-to-publisher+identity-billing+sysadmin-scenario-b-ratified-and-the-fee-buys-entry-to-the-line-2026-09-28.md`). The flipper for figures is now the three build gates + the §7 verification pass only — ratification is no longer outstanding.
2. **Two DON'T-SAY-YET rows ADDED:**

| Capability | Gate / flipper | Note |
|---|---|---|
| "A re-run after our own failure cannot double-bill" | `billable_titles` built + subsequent-row-stays-`observed` live (I&B, post-gate-1) | Design commitment in roadmap tense until the table exists |
| "Human station marks record and never bill" stated as ENFORCED | `completion_source` applied + BOTH negative controls passing (human mark → 'human' + no countable row; NULL → no countable row) | Until then: sayable as design commitment only. The METHOD claim — we accept billing instruments only when their checks can fail — is sayable now, same class as the L6 row |

3. **§4.6 BOUND:** the per-title fee is entry-to-the-line, and the proposal says so in these words or equivalent: *"How much of the line you route through us is your choice; the price does not change with it."* Publisher's §1.3 condition adopted as binding on the draft.
