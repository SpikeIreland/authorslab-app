# publisher → ux, marketing, paul
## A1 BUILT — the per-book journey is navigable, and the public page has a front door
2026-10-06 · plan: `handovers/publisher-PLAN-publishers-platform-build-checklist-2026-10-06.md`

---

## §1 What shipped

**`src/app/publisher/_components/PublisherTabStrip.tsx`** (new, 148 lines) — per-book navigation:

`Overview · Manuscript · Design · Publishing · Marketing`

- `Overview` → `/publisher/[projectId]` (built)
- `Manuscript` → `/publisher/[projectId]/read` — the reading room (built)
- `Design` → `/publisher/[projectId]/cover` — the cover studio (built)
- `Publishing`, `Marketing` → **not links.** They render in the author strip's existing `soon` state: a non-clickable span with the chip. B1/B2 turn them into links when the renders exist.

**Mounted once, in `src/app/publisher/[projectId]/layout.tsx`** — not in each of the three page files. A node added later cannot then ship with navigation on two pages and missing on the third, which is the same defect class the strip closes.

**`src/app/publishers/page.tsx`** — a `Sign in` link in the header. See §3; `marketing` owns this file.

Build: `✓ Compiled successfully`, TypeScript ran, **56/56 static pages**, probe to completion.

---

## §2 What was LIFTED rather than invented — `ux`, this is your ask to ratify

`TAB_BASE`, the active underline and the `Soon` chip are taken **verbatim** from the author's `src/app/projects/[id]/_components/ProjectTabStrip.tsx`. No new colour, no new vocabulary, no risk dots. Same reason `StationMark` moved verbatim on 2026-10-02: the two products must not drift apart visually, and a second implementation is a divergence with a delay on it.

**Nothing of yours moved.** `PublisherNav` keeps the two house-level views (`What is late`, `Where everything is`). `PublisherJourneyStrip` stays a state display — its own header rules that nothing in it is a link, and that property is untouched. This is a third, separate thing: per-book navigation, which was nobody's node, which is why it did not exist.

---

## §3 The front door — `marketing`, your file, your veto

`/publishers` had **no way in**. A house that already holds a seat landed on the marketing page and could not reach the platform from it. That is the same defect as the missing journey strip, at the other end of the funnel.

One `Sign in` link, header only:

- `/login` already routes a publisher seat to `/publisher` and an author to `/lobby` (sysadmin's geometry ruling §7), so it is **one link, not a branch**, and it names no author surface — the founding ruling holds.
- **Not repeated in the footer.** Two navigations to one destination is how a reader learns to distrust both — your own `PublisherNav` doctrine, applied to your own page.
- The `For publishing houses` kicker becomes `hidden sm:inline` so the header does not crowd on a phone.

The door is Paul's instruction; the placement is yours to overrule.

---

## §4 Not done, deliberately

**The Overview itself is still the bad page.** Paul: *"I want to go to an Overview page, but not the one that we currently have because it is terrible."* A1 only makes it reachable *as a node* rather than as a dead end. The rebuild is A4 and it now has a concrete specification, from Paul naming what the author's Overview has that this one lacks:

`src/app/projects/[id]/_components/overview/` is four components —
- `BookObjectPanel` (cover + meta) — **lift**
- `ShelfDocuments` — *"On your shelf"*: assessment PDFs, line notes, copy notes, approved drafts, cover. **This is the collateral list Paul means. Lift.**
- `JourneyStepper` (where the book is) — **lift**
- `EditorGreetingCard` — a persona greeting the author by name with a CTA into their next writing step. **Do NOT lift.** This is literally the "the chat speaks as if talking to the Author" defect. It is replaced by a house-state card: what waits on the house, what waits on the author.

Backed by `/api/projects/[id]/overview`, which needs a publisher-side equivalent reading through the publisher route.

---

## §5 House rule earned

**When a journey has no navigation, every lane builds the index instead, because the index is the only page that is reachable.**

That is the whole account of how the publisher product ended up as a house admin console — what is late, where everything is, people, house style — with three orphan per-book pages behind it. Each lane built its node correctly. Nobody owned the middle, because the middle is not a node.
