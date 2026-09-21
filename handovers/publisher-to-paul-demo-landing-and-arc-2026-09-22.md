# Publisher → Paul — Blair demo: landing page choice, 60-90s arc, and the #118 destination

**From:** `publisher` (first turn) · **To:** `paul` · **Date:** 2026-09-22 · **Status:** three decisions requested before Wednesday 2026-09-24. Founding docs read and adopted; charter accepted.

## Before the decisions — one correction to the brief

The founding brief describes `/publisher/[projectId]` as "sample data hard-coded for demo". It is **half live**. Title, author name, genre, word count, chapter count, current phase, and the per-phase chapter-approval counts all read from Supabase at page load (`manuscripts`, `editing_phases`, `chapters`). Only the covers, marketing plan, publishing-route copy and the comms thread are hard-coded.

This matters on camera. The editorial-status section falls back to counting `chapters.phase_N_approved_at` when `editing_phases.chapters_analyzed` is 0 — which it currently is for the demo project. If that chapter data is thin on Wednesday, the section renders **"0 of — chapters approved"**, which reads as broken rather than early. **I want to run a data check on the demo project ID on Tuesday** and will flag `sysadmin` if the numbers need seeding. Please confirm which project ID Carl will be using.

---

## Decision 1 — which page does Carl land on?

**My recommendation: keep the single route. Do not build a "publisher home" before Wednesday.**

The instinct to build a lighter scannable page is right about the problem and wrong about the cost. Two reasons:

1. **A "publisher home" makes a claim we can't back on camera.** A home page implies a publisher with a *list* — many authors, many books, a queue. Blair is exactly the person who will notice there is one book in it. The monolithic project view makes the narrower, true claim: *this is what your side of one book looks like.* That claim survives questions; the dashboard claim does not.
2. **The real problem is not the page, it's the fold.** Right now the cover decision — the beat that sells the portal — sits below four sections of scroll. Carl has to scroll past marketing copy to reach the thing he wants to click.

**So the fix I propose is a re-order, not a new route:** compress the project header card (it currently burns a full viewport on a 42px title and four meta fields) and lift **Cover proposals** directly beneath it, so the first screen is *book + where we are + the decision waiting*. Marketing plan and comms thread move below the route selector.

Contained change: one file, no new route, no new data, no auth. Reversible in a commit.

**Your call:** (a) re-order as above, (b) leave the order as-is and let Carl scroll, or (c) build the separate publisher home anyway and accept the dashboard question.

---

## Decision 2 — the 60-90 second arc

The brief's suggested arc ends with "a note on chapter 3 that flows back into Alex's comments in the author's studio". That is the strongest story and the most expensive one — the comms thread is local React state today. Nothing written in the portal persists, and nothing reaches the author's studio. Demoing a flow-back that does not exist is the kind of thing Blair asks a follow-up about.

**My recommended arc — three beats, every one of them already built and already reactive:**

| | Beat | What Carl does | What lands |
|---|---|---|---|
| **0-20s** | **Recognition** | Clicks over, doesn't touch anything | Same book, trade framing: title, author, word count, genre, and three named editors with chapter approval counts. *"Same book — this is their view of it."* |
| **20-50s** | **The decision** | Clicks **Approve** on one cover | Checkmark overlay lands on the cover, approval timestamp appears. The publisher is not a spectator — they act, and the surface answers. |
| **50-90s** | **The handshake** | Selects **Hybrid**, clicks **Confirm route** | *"Route confirmed — the author has been notified."* The trade-side decision turns back toward the author. |

Two clicks. Both produce immediate visible state change. No writes, no auth, no seeding beyond the demo project.

The third beat does the flow-back narrative work *without requiring the flow-back to exist* — "the author has been notified" is a promise about the product, not a claim about this build. If you would rather not make even that promise on camera I can soften the string; say the word.

**Deliberately off-camera:** the comms thread (typing live burns 20 seconds and produces a message that goes nowhere) and the marketing plan (read-only, and Carl will have covered positioning from the author side already).

**Your call:** confirm this arc, or take the chapter-note arc and accept that I need to wire a real write-through — which is a `sysadmin` + `astudio` dependency I would need to raise today to have any chance by Wednesday.

---

## Decision 3 — task #118, the cold-click destination

`ux` owns the footer treatment; the destination is mine. My call, for your ratification:

**Not sign-in-first** — there is no publisher user type. A sign-in splash is a door with nothing behind it, and it is the one thing on the page Blair might actually try.

**Not straight into a live project** — a bare `/publisher/[projectId]` is unguessable-URL-as-security. Fine for an invited preview, wrong as a public footer destination: it would put a real author's manuscript one shared link from anywhere.

**Recommendation: a static marketing preview at `/publisher`** (no projectId) — one screen saying what the Publisher Portal is, in publisher voice, with a single *"View a sample portal →"* button into the demo project. The footer link gets a defensible destination, Carl gets something to gesture at, and we claim no auth model we don't have.

Cost: one small static page, no data, no auth. **But it is a new route, so it is your call whether it lands before Wednesday** or after. I will coordinate the wording with `ux` either way.

---

## What I do next, pending your answers

- Tuesday: data check on the demo project, flag `sysadmin` if the editorial counts need seeding
- On your (a) for Decision 1: the re-order, staged and committed as one act with `git show --stat` quoted, ready for your push
- On your ratification of Decision 3: build `/publisher`, pointer to `ux` for footer wording

Not blocking on any of it — I will keep working the post-demo list (publisher auth model, cover-approval wiring into `design`, rights-split data model) while these sit.

— `publisher`

---

## AMENDMENT — 2026-09-22, same day: Decision 3 has largely resolved itself

After this note was filed, `ux` delivered their own #118 proposal (`handovers/ux-to-paul+publisher-publisher-footer-link-2026-09-21.md`) and we reached the same conclusion independently: **the cold click never lands on an auth wall; it lands on a threshold page first.** Their version is better than mine in two respects and I have withdrawn mine in its favour:

- `/publishers` (plural), not my `/publisher` — keeps the marketing surface outside my portal route tree and matches the footer's own language
- They build both pieces (footer + page) as one commit; I tune destination copy only

**Decision 3 therefore no longer needs your ruling on the shape.** `ux` is asking you for a one-line approval of their treatment; approving it approves mine.

**What survives as your call — two concrete items, both in `handovers/publisher-to-ux-footer-destination-answer-2026-09-22.md`:**

1. **Which project ID does Carl demo on Wednesday?** This is now the single blocking answer. It unblocks (a) the footer page's primary button target, (b) my Tuesday data check on the editorial counts flagged at the top of this note. One answer clears both.

2. **Does `publishers@authorslab.ai` actually receive mail?** `ux`'s page carries a `Talk to us` mailto. I don't own DNS or Resend routing. An unrouted mailbox swallows enquiries while looking perfect — silently green, per House Rules. Either confirm it routes, or name an address that is already live and I'll courier the swap when `publishers@` is ready.

One correction I have raised with `ux` directly, recorded here so it is not lost: their draft made the page's primary action *"Sign in to the Publisher Portal"*, with a fallback to *"the portal's own sign-in"*. **There is no publisher sign-in and no publisher user type** — the portal is a public path-scoped page. That CTA had no target. It becomes *"See a sample portal →"* into the demo project until real publisher auth exists (post-demo, `sysadmin` co-owns).

Decisions 1 and 2 above are unchanged and still need you.

— `publisher`
