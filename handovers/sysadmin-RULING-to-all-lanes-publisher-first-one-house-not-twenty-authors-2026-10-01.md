# SysAdmin RULING → all lanes — Publisher-first. One house with twenty authors, not twenty authors.

**From:** `sysadmin` · **To:** all lanes (`astudio`, `design`, `finance`, `identity-billing`, `marketing`, `marketing-hub`, `paul`, `publisher`, `publishing`, `ux`, `wright`)
**Date:** 2026-10-01 · **Status:** RULED by Paul, recorded here. Six rulings, five questions owed by named lanes, one decision still outstanding from Paul.

---

## 1 · The decision

Paul, this morning, in his words: it makes more sense to get **one publisher with twenty authors** than to chase twenty authors individually.

This is a reorientation of the business, not a feature request, so it is recorded as a ruling and it is open to argument. **If your lane thinks this is wrong, say so in reply** — the worst outcome is silent compliance from a lane that can see a problem the rest of us cannot.

What it does **not** mean: the author product is not cancelled, `/free-analysis` is not switched off, and nothing already shipped is withdrawn. It means that where two pieces of work compete, the one that serves a publishing house wins.

---

## 2 · Why today made the case better than an argument could

Three things happened this morning that each independently point the same way.

**The ingestion path contradicts the proposal we have already sent Oliver.** V0.12 sells High Line a publishing-house workflow — "the pilot titles enter the line", editors reviewing notes and releasing them under their own name. But the only ingestion path we own, `/onboarding`, is a consumer author funnel: before it will accept a file it requires an active Stripe subscription or a beta-tester flag, asks for a profile photograph, and asks the uploader what genre *their* book is. An Odessa editor loading a pilot title is not the author, holds no consumer subscription, and cannot answer those questions on someone else's behalf. **We are one upload away from the product contradicting the document.**

**A real manuscript ingested corrupted, and nothing noticed.** `CS The List`, 64,165 words, loaded clean as far as every screen was concerned. In fact every `fi` and `fl` in the book had become the digit `8` — `office`/`of8ice` 63 times, `first`/`8irst` 51 times. **646 corrupted words across 66 of its 80 chapters, and not one occurrence of `fi` or `fl` in 361,157 characters of English prose.** pdf-parse had decoded the font's ligature glyphs to the wrong character. A full Alex analysis then ran against that text and produced a report nobody could trust. Measured, confirmed in the database, manuscript and all dependants destroyed, re-ingesting from `.docx`.

**Three defects, one class.** The analysis trigger awaited three *synchronous* n8n webhooks that take 7, 25 and 32 minutes; the browser gave up first, the rejection was read as failure, and the author was told the analysis had broken **while all three workflows ran to completion** — with the button live again, inviting a duplicate half-hour run. Separately, `1.4 Parse Chapters` computes `expectedChapters` and never uses it, and the node the workflow is *named after* has its entire output discarded by the node downstream.

The common thread, and it is the one that matters for a publisher: **a surface asserting something its evidence cannot support.** An author forgives that. An editor at a house that has just paid £750 a month does not — they conclude the system cannot read, and they are not wrong to.

---

## 3 · The rulings

**R1 — Publisher-first is the operating priority.** Where work competes, the publishing-house path wins. Paul's decision; recorded, not mine.

**R2 — Publisher ingestion does not go through `/onboarding` or the chapter-list bridge.** A direct path: choose file, confirm title, the book is in the line. Checked rather than assumed — `/projects/[id]/author-studio` performs exactly one GET and **zero** mutations, so skipping it loses nothing persisted. `POST /api/projects/new` already creates a manuscript without the wizard; it is unreachable only because it sits behind `RELEASED.wright`.

**R3 — Entitlement for the publisher path keys off organisation membership, not Stripe.** The proposal prices £750/month plus £400 per worked title. A publisher ingestion route must not check for a consumer subscription. `identity-billing` owns the predicate. **This is the same membership row the Monday walkthrough needs** — the two questions are one question, and answering it once settles both.

**R4 — `.docx` is the preferred ingestion format; PDF is accepted but refused when it decodes badly.** `1.1 Extract PDF` now detects broken ligature decoding and refuses, naming the `.docx` route. **It refuses rather than repairs** — Paul's ruling, and the right one: we do not silently rewrite an author's words. Stated limits, because a detector nobody can see the edges of is worse than none: it will not fire on texts under 20,000 characters, nor where *some* `fi` survives. Deliberately conservative so it can never refuse a good manuscript. Not full coverage.

**R5 — A surface reports state, not intent.** Promoted from this morning's proposal on the strength of three instances in one day. A screen may claim only what its evidence supports: a dispatched request is not a completed job, and a transport failure is not a verdict about work running on a server. Where the two differ, the record — the journey row, the ledger — is the authority, never the client's optimism.

**R6 — One manuscript creation path.** Two exist today (`/api/projects/new` and n8n `01.03`). Converge on one; do not add a third. Also retired: `createManuscript()` in `queries.ts`, dead code that writes a `portal_phase` column the schema does not have and would 500 on first use.

**Carried forward from this morning, now earned twice over:** a normalising node's guarantee is only as good as its *references*, not its wiring. `Create Initial Manuscript` reached past the node whose job was to sanitise it; `Store Chapter Data` ignores the node named `Parse Chapters` entirely. The canvas shows a clean chain in both cases. Only the parameters show the truth. Going into House Rules with R5.

---

## 4 · What each lane owes, and to whom

**`paul` — still outstanding from yesterday, and it gates Monday.** Admin account or seeded persona for Oliver's walkthrough (`publisher`'s §2, 2026-09-30). `publisher` recommends the persona; I agree, and R3 means the membership row is needed anyway. One decision, two problems solved.

**`identity-billing` — Q1:** the entitlement predicate for R3. What replaces the subscription check for a publisher seat, and is it the same predicate that answers the Company tab's 403? Nothing else in R2 can ship until this is answered.

**`marketing-hub` + `publisher` — Q2:** Paul wants a **dedicated publisher public-facing page**. Whose lane, and what does it claim? It must survive the same test as everything else — no feature named on it that an editor cannot then use.

**`ux` — Q3:** Paul's picture is a staff member arriving in the morning, switching on, and clicking an **AuthorsLab icon straight to the Lobby** — not navigating to a website. That is a PWA install plus Lobby-as-post-login-default. Both small; both yours to shape.

**`finance` — Q4:** does £400-per-worked-title need a hook at ingestion, or is the trigger still "first editorial pass completes"? R2 changes where a title enters the line, so if billing observes that moment, say so now rather than after it is built.

**`astudio` — Q5:** `1.4 Parse Chapters` currently discards a prologue it has successfully detected, unless the uploader ticked a box. The text survives in `full_text`, so nothing looks broken — but the section never reaches `chapters` and **no editorial pass ever reads it.** A book analysed without its opening, silently. The fix is written — detection drives storage, the flags become advisory — and is **held pending a permission grant**, not pending a decision. Flagging because you own what the stations read: say now if storing an unflagged prologue breaks an assumption of yours.

---

## 5 · Standing

Shipped today: the `08P01` onboarding failure fixed at source; DOCX accepted on `/onboarding` and `/re-upload` behind one shared module; ligature refusal live; the analysis-trigger state bug fixed. `CS The List` destroyed across nine tables and re-ingesting from `.docx` — one corrupted storage object survives, inert, pending removal through the Storage API.

Everything in §3 is open to argument until Monday. After Monday it is how we work.

— `sysadmin`
