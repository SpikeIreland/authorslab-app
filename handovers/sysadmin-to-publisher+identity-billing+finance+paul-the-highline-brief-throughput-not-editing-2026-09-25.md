# SysAdmin → Publisher + Identity-Billing + Finance + Paul — The Highline brief: we are selling throughput, not editing

**From:** `sysadmin` · **To:** `publisher` (owns the journey), `identity-billing` (owns the org model), `finance` (owns the proposal) · **cc:** `paul`, `ux`, `design`
**Date:** 2026-09-25 · **Status:** framing + two rulings + lane assignments. Paul's decisions of 2026-09-25 recorded in §7.
**Source:** Paul's meeting with Oliver Malcolm, CEO, High Line Publishing Studio, 2026-09-24.

---

## 1 · What was actually said, and what it means

Oliver has money to spend on a system that is **"embedded in the organisation."** His dominant thought, quoted:

> **"We have taken on a lot of new authors and we need to get them to market as soon as possible."**

Read that twice before designing anything. It is not a request for better editing. It is a **throughput** statement from a CEO in startup mode: first list commissioned, first books spring 2027, two imprints, no slack in the schedule.

**He is not buying editing. He is buying certainty about dates.** Editing is how we earn the right to answer the question.

This is also why the current portal does not fit, and it is not because it is small. It is the wrong **unit**:

| | Current portal | What Highline needs |
|---|---|---|
| Unit | one manuscript | the whole list |
| Register | detail | aggregate |
| Reader | a visitor | an operator |
| Question answered | "how is this book?" | **"which book is going to slip?"** |

Those are different products that happen to share a database. Everything below follows from that.

---

## 2 · The missing primitive — the organisation

Everything we have hangs off an author and their manuscript. Nothing models a company. Highline needs:

```
Organisation (High Line Publishing Studio)
  └─ Imprint (Odessa Editions · Antidote Books)
       └─ Book  ← belongs to an imprint, not floating free
  └─ Membership (staff, UK + US, roles)
```

Jacky runs Odessa, Joel runs Antidote, and they will not always want each other's lists. Oliver must see both. Permissions cascade org → imprint → book.

**The lucky part, and we should recognise it as luck:** High Line's two-imprint shape **forces correct multi-tenancy at customer one** rather than a retrofit at customer three. Most products get this wrong because their first customer is a single team. Ours isn't. Build it as the general case.

`identity-billing` owns this (§7). It is the gating primitive — the Lobby, the permissions, the module switches and the proposal all wait on it.

---

## 3 · RULING — stage by authority, not by module

Paul's risk instinct is right and I am changing the axis. Asking a company to trust new software to run itself is foolhardy; we should say so first, and then remove the need for trust rather than ask for it.

**Every module sits at one of three levels, per organisation:**

| Level | The system may | Trust required |
|---|---|---|
| **1 · Observe** | Watch, report, predict. Change nothing. | **None** |
| **2 · Assist** | Do the work; a human approves every output | Some |
| **3 · Operate** | Run stations unattended, escalate exceptions | Earned |

Why this beats module-staging: a module switched on is still all-or-nothing *inside itself*. Authority levels let **each module sit at a different level, advanced by the customer when they trust it** — not when we say so.

It also hands us the sales answer: *at level one the system has no power to be wrong about anything except its own reporting.* And level one is where Oliver gets value immediately, because today nobody at Highline can see the pipeline at all.

Note this is not new doctrine — it is our existing human-in-the-loop commitment, made **selectable and per-customer** instead of global. The Editing Studio is already a level-2 module. We are naming what we do and handing over the dial.

**The switches belong to their admin, not to us.** Same mechanism as `RELEASED`, moved from global to per-organisation. That is the difference between a feature flag and an enterprise product.

---

## 4 · The Publisher Lobby — same shell, different question

`publisher`: Paul's read is right that it should look like the author's Lobby. One visual grammar; learn one screen and you have learned them all. **But the content answers a different question.**

- Author's Lobby: *"what am I working on?"*
- Publisher's Lobby: *"what is late?"*

Same furniture, different verb. Practically: states and target dates as first-class, sorted by risk not recency, aggregate across imprints with a per-imprint filter, and every row answering when it ships and what it is waiting on.

Two open questions, neither urgent. Paul's instinct is that publishers don't need Home-as-chat; I'd hold that open, because *"which books are at risk this month?"* is exactly a question you want to ask in words rather than read off a grid. And the left-rail contents are a UX conversation once the org model exists.

`publisher_actions`, live since 2026-09-24, is already the first row of the enterprise audit trail — append-only, attributed, who-did-what-when. That instinct was right before we had this reason for it.

---

## 5 · Proposal — shape before number (`finance`)

`finance`: do not model until scope is set, and when you do, **the shape is a positioning decision and it is made here, not in the model.**

**Per-seat is wrong.** A three-person imprint with large ambitions gets punished for being small and rewarded for staying small — backwards, and Oliver will feel it immediately.

**Per-title plus a platform fee** aligns the bill with his own stated problem: you pay for books you bring to market. It scales with his success rather than his headcount, and it makes the proposal a one-line story. Paul's objective is *an easy decision*; one line beats a matrix.

We have individual-subscription pricing and effectively nothing for publishers. That is the gap. Model it once §7's scope lands.

---

## 6 · Testing — let him test as Highline, not as "a publisher"

He wants to have a go himself. Two streams, per Paul:

**Author journey** — familiar from the meeting, and the point is for him to see what his authors see. Editing Studio at level 2, everything else observable.

**Publisher journey** — the real one, and the one he judges us on.

The thing that matters: **give him an org that is actually High Line** — Odessa and Antidote, seats he can invite Jacky and Joel into, a book in each. A CEO "having a go" means seeing his own company reflected back. A generic publisher account teaches him nothing about whether this fits.

---

## 7 · Lanes and sequence — Paul's decisions, 2026-09-25

**Scope: the full Publisher Journey.** Not a slice. The list view and the org model are its first bricks regardless, so this order delivers something real early rather than stalling on scaffolding:

1. **`identity-billing` — org / imprint / membership / roles.** Gates everything. Start now.
2. **`sysadmin` — per-org module authority levels** (§3), on top of that model.
3. **`publisher` — the Lobby** (§4), then the book surface, then approvals and staff management.
4. **`finance` — the proposal**, once 1–3 have a defined scope.

`identity-billing`: this is an extension of your lane, not a new one — you own identity, auth and entitlement, and org membership is the next layer up. Paul has the Clarence Control Room permission model available if it helps; ask him. Flagging one trap now: `manuscripts.publisher_id` is the tempting first migration and `publisher` has already shown it cannot express the Hybrid route. Do not start there.

---

## 8 · What we do not promise

**"Embedded in the organisation" has teeth.** It implies integration with what they already run, Hachette distribution, contracts, royalties, and UK/US data questions. We should not nod along to embedding we cannot do. The affordance rule applies to sentences in a proposal exactly as it applies to buttons.

**And the standing risk: becoming a bespoke software house for one customer.** The discipline is to build Highline's needs *as the general case*. The two imprints help. Every time we are tempted to hard-code something that is true of High Line, that is the moment to ask what the general version is.

---

— `sysadmin`
