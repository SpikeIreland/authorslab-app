# AuthorsLab × High Line Publishing Studio — Proposal

**WORKING DRAFT V0.2 · 2026-09-28 · INTERNAL — NOT FOR SEND**
Held by `finance` under the 2026-09-28 commission, as amended by Paul. V0.2 consumes `publisher`'s scope supply (their courier of this date): HOLE 1 is filled — Lobby in **roadmap tense**, which publisher moves to present tense themselves after opening the surface; scope sentences go to publisher for live/roadmap/wrong marking. Binding: SAY table v2.4. Present-tense claims carry `⟨trace: …⟩`, stripped after the verification pass.

**HOLE LEDGER:** ~~HOLE 1~~ filled (roadmap tense; publisher flips + countersigns before anything reaches Oliver) · `[HOLE 2 — identity-billing: staff & permissions, buyer's language]` · `[HOLE 3 — sysadmin: authority-level mechanics]` · `[HOLE 4 — publishing: format-by-format last mile]`

---

## 1 · The problem, in your words

*"We have taken on a lot of new authors and we need to get them to market as soon as possible."*

That sentence is a throughput problem, and throughput problems have a particular shape: the cost of a slow book is not the editing bill — it is the season it misses. Which means the question that actually needs answering, every week, for every title on the list, is not *"how is it going?"* but **"which book is going to slip?"**

This proposal is about a production line for getting manuscripts ready for market, and the instruments that let you see it running. Everything in it exists to make you more certain about when your books reach market; anything that doesn't serve that question, we have left out.

## 2 · High Line, specifically

Two imprints — Odessa under Jacky, Antidote under Joel — publishing UK and US with Hachette distribution, first list commissioned, first books in spring 2027. A new house moving at commissioning speed, which means the manuscripts arrive faster than a traditional production calendar was built to absorb. You saw an early cut of the publisher view when we met ⟨trace: meeting canonical 2026-09-28 §8⟩; this document says precisely what stands behind it today, what is in build, and what is not there yet. You spent two years being paid to spot the difference, so we have not blurred it.

## 3 · What the system does about it

**The production line.** Every book moves through seven stations. For each one the system records what was done, who ran it, what has to be true for the book to leave, and **who closes that gate** — the author or the publisher ⟨trace: line route, live — L1⟩. Not a status word; the mechanism that earned the word. The editorial stations are run by a named AI editorial team — Alex (developmental), Sam (line), Jordan (copy) — working full manuscripts, chapter by chapter ⟨trace: live product, authorslab.ai; production DB: 272+ chapters, 4,061+ editor–author messages, reads 2026-09-22⟩.

**The book surface is the drill-down.** When a title needs attention, one click gives the reason: the stations, the gates, the decisions recorded against it, the manuscript itself — chapter spine and prose on demand — and the cover ⟨trace: book surface, manuscript reader, cover studio — live, L3/L4⟩.

**Decisions are recorded and cannot be edited afterwards.** When a publisher approves a cover or asks for a revision, that becomes an attributed, append-only entry — who did what, when — that no one can rewrite later, including us ⟨trace: publisher_actions, live since 2026-09-24 — L5⟩.

**Everything the machine does is metered.** Every AI action is recorded per call, per author, per manuscript, per station — model, tokens, latency, cost ⟨trace: lmo_ledger, live since 2026-07-27⟩. Editorial work is a defined, countable, change-controlled unit: a completed editor journey. **A pass that fails costs us and bills you nothing** ⟨trace: Editorial Pass Contract V1, ratified 2026-09-22/23⟩.

**In build this week — the Lobby, the list-level answer.** One screen for the whole list, sorted by what needs attention rather than by what happened last, filterable per imprint. Each row: where the book is, who it is waiting on, how long since anything has moved. The aggregate will answer *which*; the drill-down already answers *why*. ⟨status: built this week, not yet confirmed running — roadmap tense until publisher opens it and flips this paragraph themselves⟩

## 4 · What is live today, what is in build, and what we are not claiming

You read proposals for what is missing. Here is the missing, named by us first.

**Live in production today:** the production line, the book surface, the manuscript reader, the cover studio, the attributed decision record, the metering, and public author-side pricing at authorslab.ai/pricing ⟨trace: publisher supply 2026-09-28 §2 + SAY v2.4⟩.

**Built this week, not yet confirmed running:** the Lobby. It compiles clean and its logic is tested — including tests designed to fail when the logic is wrong, which we broke on purpose to prove they could ⟨trace: 15/15 with 5 negative controls; mutation check passed⟩. It has not yet been seen rendered against a live organisation, so in this document it stays in build until it has been.

**In build, named honestly:** the working surfaces for organisations, imprints, seats and permissions — the foundations are applied in the production database ⟨trace: org migration applied + independently countersigned, 2026-09-28⟩, the screens are not. Per-module authority levels — designed and ruled, not yet enforced. Publisher-side manuscript upload. Sending a recorded note through to the author.

> **[HOLE 2 — STAFF & PERMISSIONS: what a High Line admin can do on day one, in a buyer's language. Supplied by `identity-billing`.]**

**Visibility, not forecasting — said plainly.** What the system can honestly tell you today is **what has moved, what has not, and who each book is waiting on** — and a stalled book with a publisher-side gate open is exactly the thing nobody at High Line can see today. What it cannot yet say is *"this book will miss March"*: the system does not yet hold a target date for a book in production, so where no date exists the surface says so — *"no target date set yet"* — and a moving book is called **moving**, never *"on track"*. The next primitive on our line is the one your question asks for: a per-title target date, set by you when a book joins an imprint, so that *late* has something to be measured against. We would rather name where our answer currently stops than imply it doesn't.

**A method, not just a promise.** Where a control's machinery does not exist yet, the control is hidden by construction — it cannot appear in the interface. We removed working-looking controls from these very screens last week for exactly that reason ⟨trace: usePublisherActions.ts — L6⟩. The same rule produced this document: nothing here is in the present tense unless it is live in production.

**Where our line ends.** Our stations run to a finished, edited manuscript — then it is **handed off**. Formatting for your distribution channel and platform access sit with your existing route to market; we do not own that last mile and this proposal does not price it.

> **[HOLE 4 — the format-by-format specifics of that boundary. Supplied by `publishing`.]**

**What we are explicitly not claiming.** You told us you want this embedded in the organisation. We understand why, and it is the right ambition — *and it is your goal, not yet our capability.* No integration with your existing systems, with Hachette's distribution machinery, with contracts or royalties, is claimed anywhere in this document. What we are proposing is the production line and its instruments, run alongside what you have, with the record it produces as the argument for what comes next.

## 5 · How you adopt it without betting the company

Adoption is per-module and moves at your pace through three levels: **Observe, Assist, Operate** — switches held by your admin, not by us. At level one — Observe — the system **changes nothing about the work; it records what was done** ⟨trace: level-1 ruling as amended, 2026-09-28⟩. Your editors keep working exactly as they do; the system watches the line and keeps the record.

> **[HOLE 3 — the authority-level mechanics: what the switches are, who holds them, what each level permits. Supplied by `sysadmin` when the grants are real (gate 3).]**

The commercial consequence is deliberate: **the level boundary and the billing boundary are the same line** ⟨trace: input #3 ruling, 2026-09-28⟩. The platform fee buys the instrument at level one, across everything. Per-title fees exist only where the system does the work — a title whose stations are only ever marked by your own people records, and never bills. A publisher who sits at Observe forever, using their own editors throughout, pays the platform fee and nothing else. That is the floor working as designed, not a loophole we will close later.

## 6 · What it costs

Two numbers, GBP, and no meters behind either of them.

**Platform fee: £750 per month.** The instrument — the whole backlog, every seat, every imprint, at whatever authority levels you set. Seats are deliberately unpriced: charging per seat would punish a three-person imprint for being small and reward it for staying small, which is backwards for a house trying to grow a list. The database that runs this counts no seats anywhere ⟨trace: org model, schema⟩ — the pitch, the price, and the system say one thing.

**Per title worked: £400.** Fired once, when the system completes its first editorial station for that title — never per month, never per pass. It opens our full editorial line to that book: all three editors, at the authority level you have set, with re-runs within fair use. **How much of the line you route through us is your choice; the price does not change with it.** A book you load but never put through the line is never billed. A book whose launch your channel delays is not billed again for waiting.

Why per-title: **you already account per title.** Every book on your list carries its own P&L with editorial, production and marketing set against it. £400 lands as one line inside a cost structure you already run — next to a human editorial line that runs £1,600–£8,000 for a single pass on the same book ⟨trace: comparables verified 2026-07-28⟩ — rather than asking you to open a new software-overhead line and allocate it.

What a year looks like: fifteen titles worked, **£15,000**. A steady thirty-title year, **£21,000** — against a list whose human editorial alone would run several times that. And the Observe-only bound is on the table by design: never fire a single system station and the year costs **£9,000 flat**.

## 7 · What happens next

One decision, and it is a small one: **name two titles — one from Odessa, one from Antidote.**

We run them through the line as a pilot. **Free — the pilot converts to the terms above only when the first editorial journey completes on your titles, and nothing converts while nothing completes.** The same event that starts the clock is the event we meter, so the first thing you are ever billed for is a thing that visibly happened, on your book, in your record.

What the pilot gives you is the answer to §1 on your own manuscripts rather than on our claims. What it gives us is the record: from the first day, at Observe, the system is building the station-by-station history of how your books actually move — which is the raw material every honest answer to *"which book is going to slip"* is made from. The pilot doesn't just test the machine; it starts the instrument.

---

*Contract mechanics carried as working positions: UK contracting entity, GBP, invoiced net-30 — confirmed at signature. These terms are an opening position for High Line specifically, not a rate card.*

**— DRAFT ENDS —**

*Verification pass pending (N claims, M traced, 0 untraced). §3–§4 sentences with `publisher` for live/roadmap/wrong marking; executed countersign against the open surfaces before anything reaches Oliver. Adversarial read: `sysadmin`. Voice pass: `marketing`. Paul + Carl own the send.*
