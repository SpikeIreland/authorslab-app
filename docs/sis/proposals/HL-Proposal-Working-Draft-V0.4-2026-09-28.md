# AuthorsLab × High Line Publishing — A proposed infrastructure partnership

**WORKING DRAFT V0.4 · 2026-09-28 · INTERNAL — NOT FOR SEND**
V0.4 = V0.3 + implementation-partnership commitment in §7 (Paul, 2026-09-28). The 'Oliver tries the system' offer lives in the COVER EMAIL, not this document — the proposal's ask stays one small decision. VOICE FLAG (Paul, 2026-09-28): platform-building register in places ("compiled clean", "negative controls") — Carl gives it an authors-view pass; translate the register, never weaken the traced claims. Architecture first, finances as a section, per Carl. Binding: SAY table v2.4; `⟨trace:⟩` annotations stripped after verification. Holes: `[HOLE 2 — I&B: staff & permissions]` · `[HOLE 3 — sysadmin: authority-level mechanics]` · `[HOLE 4 — publishing: formats boundary]`. Lobby paragraphs remain roadmap tense until `publisher` flips them.

---

## Purpose

High Line is building a new publishing operation — and the systems, workflows and infrastructure around its author list, at the same time as the list itself. This proposal positions AuthorsLab not as a software purchase but as an **infrastructure partner**: a connected environment for authors, editorial teams and publishing management, adopted progressively, with minimal operational or financial friction, that develops alongside the publishing operation rather than requiring High Line to build every component internally.

## 1 · The problem, in your words

*"We have taken on a lot of new authors and we need to get them to market as soon as possible."*

That is a throughput problem, and throughput problems have a particular shape: the cost of a slow book is not the editing bill — it is the season it misses. The question that needs answering every week, for every title, is not *"how is it going?"* but **"which book is going to slip?"** Everything in this proposal exists to make you more certain about when your books reach market.

## 2 · The proposition

One environment around the life of a book: manuscript development and editorial workflow today; project and author visibility for the publisher; and, as the partnership develops, author development and research, cover design, formatting, and downstream publishing and marketing capability. Much of the foundation is already built and working — and we would rather show you exactly which parts than round up. What is not built yet, we develop as partners, in the order your operation actually needs it.

## 3 · What the system does today

**The production line.** Every book moves through seven stations. For each one the system records what was done, who ran it, what has to be true for the book to leave, and **who closes that gate** — the author or the publisher ⟨trace: line route, live — L1⟩. Not a status word; the mechanism that earned the word. The editorial stations are run by a named AI editorial team — Alex (developmental), Sam (line), Jordan (copy) — working full manuscripts, chapter by chapter ⟨trace: live product, authorslab.ai; 272+ chapters, 4,061+ editor–author messages in production, reads 2026-09-22⟩.

**The book surface is the drill-down.** When a title needs attention, one click gives the reason: the stations, the gates, the decisions recorded against it, the manuscript itself, the cover ⟨trace: live — L3/L4⟩.

**Decisions leave a record.** A cover approval or a revision request becomes an attributed, append-only entry — who did what, when — that no one can rewrite afterwards, including us ⟨trace: publisher_actions, live since 2026-09-24 — L5⟩.

**Everything the machine does is metered** — every AI action recorded per call, per author, per manuscript, per station ⟨trace: lmo_ledger, live since 2026-07-27⟩. Editorial work is a defined countable unit: a completed editor journey. **A pass that fails costs us and bills you nothing** ⟨trace: Editorial Pass Contract V1⟩.

**In build this week — the Lobby, the list-level answer.** One screen for the whole list, sorted by what needs attention, filterable per imprint. Each row: where the book is, who it is waiting on, how long since anything has moved. ⟨status: roadmap tense until publisher opens + flips⟩

## 4 · A phased implementation

Adoption is phased twice over, and both dials are in your hands.

**Phase 1 — Editorial foundation (this proposal).** The publisher workspace, your authors and projects, and the Developmental → Line → Copy editorial workflow. It starts with **two pilot titles**, one per imprint, so High Line tests the platform on real authors, real books, real workflows — free until the first editorial journey completes (§6).

**Phase 2 — Creative & production.** Once the editorial workflow is established: the wider production environment — cover design, formatting, and author development and research through Wright — explored together, with commercials agreed then, not now.

**Phase 3 — Publishing ecosystem.** As High Line develops: marketing and further downstream capability, where there is a clear operational fit.

**And within every phase, an authority dial:** Observe → Assist → Operate, per module, switches held by your admin, not by us. At Observe the system **changes nothing about the work; it records what was done** ⟨trace: level-1 ruling, 2026-09-28⟩ — your editors keep working exactly as they do, and you advance a module only when you choose.

> **[HOLE 3 — the authority-level mechanics: what the switches are, who holds them, what each level permits. Supplied by `sysadmin` when the grants are real (gate 3).]**

## 5 · What is live, what is in build, what we are not claiming

You read proposals for what is missing. Here is the missing, named by us first.

**Live in production today:** the production line, the book surface, the manuscript reader, the cover studio, the attributed decision record, the metering, and public author-side pricing at authorslab.ai/pricing ⟨trace: publisher supply 2026-09-28 + SAY v2.4⟩.

**Built this week, not yet confirmed running:** the Lobby — compiled clean, logic tested with checks designed to fail when the logic is wrong (we broke it on purpose to prove they could) ⟨trace: 15/15, 5 negative controls, mutation-checked⟩; it stays "in build" here until it has been seen running against a live organisation.

**In build, named honestly:** the working surfaces for organisations, imprints, seats and permissions — foundations applied in the production database ⟨trace: org migration applied + independently countersigned, 2026-09-28⟩, screens in progress. Per-module authority levels — designed and ruled, not yet enforced. Publisher-side upload. Sending a recorded note through to the author.

> **[HOLE 2 — STAFF & PERMISSIONS: what a High Line admin can do on day one, in a buyer's language. Supplied by `identity-billing`.]**

**Visibility, not forecasting — said plainly.** What the system can honestly tell you today is **what has moved, what has not, and who each book is waiting on** — a stalled book with a publisher-side gate open is exactly the thing nobody at High Line can see today. What it cannot yet say is *"this book will miss March"*: there is no target date held per book in production, so where no date exists the surface says so, and a moving book is called **moving**, never *"on track"*. The next primitive on our line is the one your question asks for: a per-title target date, set by you, so that *late* has something to be measured against.

**A method, not just a promise.** Where a control's machinery does not exist, the control is hidden by construction — it cannot appear in the interface; we removed working-looking controls from these screens last week for exactly that reason ⟨trace: L6⟩. The same rule produced this document.

**Where our line ends.** Our stations run to a finished, edited manuscript — then it is **handed off**. Formatting for your distribution channel and platform access sit with your existing route to market; we do not own that last mile and this proposal does not price it.

> **[HOLE 4 — format-by-format specifics. Supplied by `publishing`.]**

**What we are explicitly not claiming.** You want this embedded in the organisation — the right ambition, and *your goal, not yet our capability*. No integration with your existing systems, Hachette's distribution machinery, contracts or royalties is claimed anywhere here. What we propose runs alongside what you have, with the record it produces as the argument for what comes next.

## 6 · The commercial principle

Simple, and aligned to value. Two numbers, GBP, nothing metered behind either.

**Platform fee: £750 per month** — the instrument: the whole backlog, every seat, every imprint, at whatever authority levels you set. Seats are deliberately unpriced: per-seat pricing would punish a three-person imprint for being small, which is backwards for a house growing a list. The database that runs this counts no seats anywhere ⟨trace: schema⟩.

**Per title entering the editorial workflow: £400, once** — fired when the system completes its first editorial station for that title. It opens the full editorial line to that book: all three editors, at your authority level, re-runs within fair use. **How much of the line you route through us is your choice; the price does not change with it.** A book loaded but never worked is never billed; a book whose launch is delayed downstream is not billed again for waiting.

**Principles:** no per-seat pricing; no usage meters; no overage charges; a clear relationship between payment and actual title activity. You already account per title — £400 lands as one line inside a cost structure you already run, next to human editorial at £1,600–£8,000 for a single pass on the same book ⟨trace: comparables verified 2026-07-28⟩. A fifteen-title year is **£15,000**; a thirty-title year **£21,000**; and if you keep your own editors throughout and use only the visibility layer, a year is **£9,000 flat** — a floor we designed, not a loophole.

**The pilot: two titles, one per imprint, free** — converting to these terms only when the first editorial journey completes on your books. Nothing converts while nothing completes; the first thing you are ever billed for is a thing that visibly happened, in your record.

## 7 · Proposed next step

One small decision: **agree the two pilot titles, one from Odessa, one from Antidote.**

Then, in order: we establish the High Line workspace — your organisation, your two imprints, your team's access arriving with it; the pilot titles enter the line; the first editorial journeys run; and we review the experience together before agreeing the next phase.

**You will not be implementing alone.** Carl, our co-founder, will be personally available to work with your team on implementation inside High Line — setup, workflow fit, and the first journeys. And we will be asking for feedback throughout, deliberately: the point of the pilot is to shape the platform around how High Line actually runs, so the system earns its place by making your operation measurably more efficient, not by asking your operation to bend around it.

The objective is not to sell High Line software. It is to help a new publisher establish modern publishing infrastructure with as little friction as possible — and to earn each next phase by what the last one measurably did.

---

*Working positions: UK contracting entity, GBP, invoiced net-30 — confirmed at signature. Opening terms for High Line specifically, not a rate card.*

**— DRAFT ENDS —**

*Verification pass pending (N claims, M traced, 0 untraced). Publisher marking §3/§5 live/roadmap/wrong; executed countersign against open surfaces before send. Adversarial read: sysadmin. Voice pass: marketing. Paul + Carl own the send.*
