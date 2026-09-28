# AuthorsLab × High Line Publishing Studio — Proposal

**WORKING DRAFT V0.1 · 2026-09-28 · INTERNAL — NOT FOR SEND**
Held by `finance` under the 2026-09-28 commission, as amended by Paul (drafting authorised ahead of gates 2–3; nothing sent until the verification pass, publisher's executed countersign, sysadmin's adversarial read, and Paul + Carl approve). Binding instrument: SAY / DON'T-SAY-YET table v2.4. Present-tense claims carry their trace inline as `⟨trace: …⟩` — these annotations are stripped from the send copy after the verification pass counts them.

**HOLE LEDGER — four sections carry no finance-written text, by rule:**
`[HOLE 1— publisher: Lobby scope]` · `[HOLE 2 — identity-billing: staff & permissions, buyer's language]` · `[HOLE 3 — sysadmin: authority-level mechanics]` · `[HOLE 4 — publishing: format-by-format last mile]`

---

## 1 · The problem, in your words

*"We have taken on a lot of new authors and we need to get them to market as soon as possible."*

That sentence is a throughput problem, and throughput problems have a particular shape: the cost of a slow book is not the editing bill — it is the season it misses. Which means the question that actually needs answering, every week, for every title on the list, is not *"how is it going?"* but **"which book is going to slip?"**

This proposal is about a production line for getting manuscripts ready for market, and the instruments that let you see it running. Everything in it exists to make you more certain about when your books reach market; anything that doesn't serve that question, we have left out.

## 2 · High Line, specifically

Two imprints — Odessa under Jacky, Antidote under Joel — publishing UK and US with Hachette distribution, first list commissioned, first books in spring 2027. A new house moving at commissioning speed, which means the manuscripts arrive faster than a traditional production calendar was built to absorb. You saw an early cut of the publisher view when we met ⟨trace: meeting canonical 2026-09-28, §8 — portal lobby was shown⟩; this document says precisely what stands behind it today, what is in build, and what is not there yet. You spent two years being paid to spot the difference, so we have not blurred it.

## 3 · What the system does about it

**The editorial line.** A named AI editorial team — Alex (developmental), Sam (line), Jordan (copy) — runs full-manuscript editorial passes in that order; authors work chapter by chapter and download the result ⟨trace: live product, authorslab.ai; production DB: 272+ chapters, 4,061+ editor–author messages, reads 2026-09-22⟩.

**The line is visible.** A book's production is inspectable station by station — which operator, which gate must close, who closes it — with call counts drawn from the live ledger, not from a status field somebody remembered to update ⟨trace: line route, live — L1⟩. A publisher can read the manuscript itself, chapter spine and prose on demand, and inspect cover assets ⟨trace: read + cover routes, live — L3/L4⟩.

**Decisions leave a record.** Notes and decisions recorded on a book are attributed and append-only — they cannot be edited afterwards, by anyone, including us ⟨trace: publisher_actions, live since 2026-09-24 — L5⟩.

**Everything the machine does is metered.** Every AI action is recorded per call, per author, per manuscript, per station — model, tokens, latency, cost ⟨trace: lmo_ledger, live in production since 2026-07-27⟩. Editorial work is a defined, countable, change-controlled unit: a completed editor journey. Completion is the unit; attempts are not. **A pass that fails costs us and bills you nothing** ⟨trace: Editorial Pass Contract V1, ratified 2026-09-22/23; CHECK-constrained⟩.

**The list-level view — which book is going to slip:**

> **[HOLE 1 — THE LOBBY. Supplied and countersigned by `publisher` after their own open of the surface. No text written here by finance, by rule.]**

One sentence we can already stand behind at list level, because it is how the surface is built rather than what it promises: **the system reports what has moved and what is waiting on whom, and it says so plainly when it has no date to measure against — it never manufactures "on track" from nothing** ⟨trace: Lobby riskBasis instrument; gate 2 — flips to full present tense on publisher's countersign⟩.

## 4 · What is live today, what is in build, and what we are not claiming

You read proposals for what is missing. Here is the missing, named by us first.

**Live in production today:** everything traced in §3 above — the editorial line, the per-station visibility, the manuscript and cover reads, the append-only decision record, the metering, and public author-side pricing at authorslab.ai/pricing ⟨trace: verified in production 2026-09-22⟩.

**In build now, on applied foundations:** the organisation model — High Line as a real tenant, Odessa and Antidote as real imprints, staff memberships with roles — is applied in the production database ⟨trace: org migration applied + independently countersigned from the catalog, 2026-09-28⟩, with the working surfaces on top of it in build.

> **[HOLE 2 — STAFF & PERMISSIONS: what a High Line admin can do on day one, in a buyer's language. Supplied by `identity-billing`.]**

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

*Verification pass pending (every claim traced, population stated: N claims, M traced, 0 untraced). Scope section to `publisher` as prose for executed countersign once HOLE 1 fills. Adversarial read: `sysadmin`. Voice pass: `marketing`, then Paul + Carl. Nothing sends without both.*
