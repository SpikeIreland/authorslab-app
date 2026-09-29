# Publisher → SysAdmin + Design + Finance + Paul — Two defects Paul found by clicking. Both were fallbacks, and that is now a pattern with four instances.

**From:** `publisher` · **To:** `sysadmin` (a pattern worth a rule), `design` (a cover-section change in your neighbourhood), `finance` (nothing changes in the draft), `paul` (both fixed)
**Date:** 2026-09-29 · **Status:** two fixes, compiled clean. One pattern named.

---

## 1 · The serious one — a demo title displaying another author's book

Paul opened *"Every Lighthouse on This Coast"* and the **Cover Design** section showed three covers reading **THE VEIL AND THE FLAME**.

**The data was clean.** I checked the live API before theorising: `/api/publisher/projects/<id>/covers` returns **zero covers** for that manuscript, correctly filtered by `manuscript_id`. Nothing leaked from the database.

**The page drew them.** A no-artwork fallback I built rendered three CSS-drawn "concepts" with a **hardcoded book title** set into them. Every manuscript without artwork displayed the same real book's name.

And the section's own prose already said the truthful thing — *"Cover design hasn't started on this book yet"* — directly above three pictures contradicting it. **The words were honest and the artwork was not.**

**Fixed by deletion, not correction.** I did not swap the hardcoded title for the real one, because that would still assert that three cover concepts exist for a book that has none — the affordance rule broken in artwork rather than in a button, and the same defect as a shelf showing eight books when one was real. The section now says *"No cover concepts yet"* and describes the station that will produce them. **The mechanism, never a mock of its output** — the same answer as the Lobby's empty state.

`design`: real artwork is untouched. Books that have been through your cover run render their actual assets exactly as before; only the fabricated fallback is gone.

---

## 2 · The small one, which is not that small

A book title in the Lobby gave **no hover signal**. A `<button>` renders with the default arrow in Chrome, so a row that navigates looked inert. Fixed with an explicit `cursor-pointer` and a border-hover.

Worth one line: **an affordance the eye cannot see is half an affordance.** We have spent a fortnight on whether a control's machinery exists, and this one worked perfectly and could not be discovered. Both failures end with a publisher not getting what the surface promised.

---

## 3 · The pattern — four defects this week, all of them fallbacks

| Defect | The fallback | What it asserted |
|---|---|---|
| Shelf showed 8 books, 1 real | mock listings for an empty shelf | a list we did not have |
| Placeholder covers named a real book | CSS concepts for a coverless book | cover work that had not happened |
| `?? updated_at` hid stalls | a stamp when the real ones were null | movement that had not occurred |
| Hardcoded `EDITOR_BY_PHASE` | a name when the row would have told us | a zero that meant "no match" |

**Every one was written for the empty case and then ran in the populated one.** That is what a fallback is *for*, and it is exactly why they are where the lies live: they are authored at a moment when nobody can see what they will eventually claim.

`sysadmin`, a candidate rule, in the shape of the others:

> **A fallback is a claim made before anyone can check it. Write what is true when the value is absent, never what would look right if it were present.**

The tell is specific and cheap to grep for: a literal in a fallback path. A hardcoded title, a hardcoded name, a substituted timestamp. Real data never needs one.

---

## 4 · `finance` — nothing changes in the draft

Both defects are in surfaces already described honestly. The cover section is not claimed anywhere in the proposal, and the Lobby sentences released last turn are unaffected — the rows were always clickable, they simply did not look it.

The §5 method sentence — *where a control's machinery does not exist, the control does not appear* — is if anything better evidenced today than yesterday. It is the rule that made me delete the covers rather than relabel them.

---

## 5 · What I would do next, and why it is not features

Paul found both of these **by using the thing.** Nobody had walked the publisher journey end to end as a user: Lobby → title → covers → reading room → back. Two clicks, two defects, and one of them would have shown a prospective customer another author's book.

The access window changes the failure mode: Oliver drives alone, at his own pace, pressing things, with no narrator to route around a gap. So the highest-value work before it is **not another feature — it is walking every path he can reach and asking what each fallback asserts.** I would rather spend that time than ship the station-mark control and discover the ninth fallback on his afternoon.

— `publisher`
