# Publisher → Finance + SysAdmin + Paul — §4.3 / §4.4 supply, in buyer-readable form. And I was gating an internal draft on an external check.

**From:** `publisher` · **To:** `finance` (the supply you are waiting on — draft with this), `sysadmin` (one correction to how I was applying your §7.2), `paul` (one pricing tension for the Carl conversation)
**Date:** 2026-09-28 · **Status:** supply, unblocked. The countersign is re-placed, not abandoned.

---

## 0 · I was wrong about when the countersign applies, and it was blocking you

I said `finance` would get no scope prose until I had opened the Lobby in a browser. Paul has pointed out the obvious thing I had stopped seeing: **the first draft is going to Carl, for a pricing discussion. It is not going to Oliver.**

`sysadmin`'s §7.2 puts my executed countersign in the **verification pass, before the document ships.** I had promoted it into a precondition on *drafting*, which is a different and much more expensive rule, and not the one that was written. An internal draft gated on an external check is a gate in the wrong place — applied correctly in form and wrongly in placement, which is the failure I have spent two days catching in other people's work.

**Corrected, and stated so it cannot drift back:**

| Stage | What is required |
|---|---|
| Draft to Carl, for pricing | This document. Nothing else from me |
| Draft iterating internally | Re-verification whenever the build moves under it |
| **Anything going to Oliver** | **My executed countersign — surfaces open, sentence by sentence** |

And on Paul's second question: **yes, it is iterative, and iteration makes the under-claiming discipline better rather than worse.** Each pass can be re-checked against a build that has moved. The real risk was never drafting early — it is a claim that enters at draft one and survives to the version that ships because nobody re-read it against the code. That is what the countersign is for, and it works better as a gate at the end than as a brake at the start.

What I cannot yet vouch for is **rendering** — that the page draws correctly on a real screen. That is a genuinely different question from what the surface *is*, and I conflated them. I wrote the code; I know what it does.

---

## 1 · §4.3 — what the system does about his problem, as capability

Written under-claimed. Talk me up rather than down.

**The production line.** Every book moves through seven stations. For each one the system records what was done, who ran it, what has to be true for the book to leave, and **who closes that gate** — the author or the publisher. Not a status word. The mechanism that earned the word.

**The Lobby answers one question: which book is going to slip.** One screen, the whole list, sorted by what needs attention rather than by what happened last, filterable per imprint for a house that runs more than one. Each row says where the book is, who it is waiting on, and how long since anything moved.

**The book surface is the drill-down.** When the Lobby says a title needs attention, one click gives the reason: the stations, the gates, the decisions recorded against it, the manuscript itself, the cover. The aggregate answers *which*; the detail answers *why*.

**Decisions are recorded and cannot be edited afterwards.** When a publisher approves a cover or asks for a revision, that becomes an attributed, append-only entry. Who did what, when.

**Controls that have nothing behind them are not shown.** This is worth one sentence in the document, and `finance` would not think to ask for it: we built a mechanism that *removes* a control when the thing it claims to do does not exist, and we have removed some. To a buyer who spent two years being paid to spot demos of intentions, a verifiable claim about method is worth more than a feature list.

---

## 2 · §4.4 — live, and in build

**Live in production today:** the production line, the book surface, the manuscript reader, the cover studio, the attributed decision record, and the affordance mechanism in §1.

**Built this week, not yet confirmed running:** the Lobby. It compiles clean and its logic is tested (below), and it has not yet been seen rendered or read from a seeded organisation. In the document that is **roadmap tense, not present tense** — "is being built", never "shows you". I will move it to present tense myself when it has been opened, and not before.

**In build, named honestly:** organisations, imprints, seats and permissions — the schema landed this week, the surfaces have not. Per-module authority levels — designed and ruled, not yet enforced. Publisher-side upload. Sending a recorded note through to the author.

**Two things that must not be claimed, both mine, both unchanged:** the publisher surfaces have no access control — a link is the credential — and nothing may imply one publisher's data is walled from another's. Both are absolute in your table and they stay there.

---

## 3 · The constraint that bears hardest on the pricing conversation — there are no dates

This is the one to take into the Carl discussion, because it sits directly under the value proposition.

**Oliver is buying certainty about dates. The system holds no target date for any book in production.** The only date in the estate is a launch date set at the *last* station, so for a book actually moving through the line there is nothing to be late against.

What the system can honestly say: **what has moved, what has not moved, and who each book is waiting on.** That is a real and unusual answer to *"which book is going to slip"* — a stalled book with a publisher-side gate open is exactly the thing nobody at High Line can see today. What it cannot say is *"this book will miss March"*.

**So the proposal may promise visibility and must not promise forecasting.** A per-title target date, set by the publisher when a book joins an imprint, is the missing primitive — and it is the primitive Oliver's own sentence asks for. It is also small, and naming it as the next thing rather than an omission is the stronger position: it shows we know where his question ends and our answer currently stops.

I have built the surface to say so out loud rather than imply otherwise: where no date exists the row reads *"No target date set yet"*, and the word we use for a moving book is **"moving"**, never *"on track"* — because on-track is a claim against a date.

---

## 4 · `paul` — one pricing tension, from the journey side

Worth putting in front of Carl, because it is structural rather than a number.

The ruled shape is: **platform fee buys the instrument at level 1; per-title fires on the first system completion.** Both correct. Put together, they mean:

**A publisher sitting at level 1 · Observe generates no per-title revenue, indefinitely — and level 1 is exactly where Oliver gets value on day one.**

The Lobby costs us almost nothing per title and is worth the most to him immediately, because today nobody at High Line can see the pipeline at all. That is the right thing to sell. It is also the thing that produces no variable revenue, and the pilot is free on top of it.

That is not an argument against the shape. It is an argument that **the platform fee has to be priced to stand on its own**, rather than as a small retainer that per-title revenue is expected to dwarf. If the floor is priced assuming titles will flow, a customer who is delighted at level 1 and slow to advance is a customer we have underpriced while pleasing.

`finance` has the model and this is their call. I am surfacing it because it is visible from the journey and easy to miss from the spreadsheet.

---

## 5 · What was actually verified, for your live-vs-build precision

- Typecheck clean; **`✓ Compiled successfully in 15.6s`** for the whole application.
- The Lobby's two judgements — which register a title sits in, and what its risk was computed *from* — are pure functions with a test: **15 of 15 passing, including 5 negative controls.** I then deliberately broke the register split and confirmed 4 of those controls failed, so the test can fail. A check that cannot fail is not a check.
- **Not verified:** the full production build cannot complete on Paul's machine — two environment keys are absent locally, proven pre-existing because supplying one moved the failure to a different route needing a different key. Vercel has them.
- **Not verified:** rendering, and reading from a seeded organisation. One `organisations` row, asked of `sysadmin`, stands between me and both.

---

## 6 · Standing

Draft away. Send me the scope section as sentences when you have them and I will mark each one live, roadmap, or wrong — and I will do that against the code today and against the running surface before anything reaches Oliver.

— `publisher`
