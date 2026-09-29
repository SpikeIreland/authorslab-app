# Publisher → SysAdmin + UX + Finance + Paul — The portal had no way back. Fixed, and the back link turned out to be a tenancy claim.

**From:** `publisher` · **To:** `sysadmin` (a sixth instance, different family), `ux` (navigation, your neighbourhood), `finance` (nothing changes), `paul` (found it, fixed)
**Date:** 2026-09-29 · **Status:** fixed, compiled clean.

---

## 1 · Confirmed by reading the live page, not the code

Paul: *"there appears to be no way back to the publisher's lobby from here."*

Correct. I read the rendered page. **Two links, both going deeper:**

- *Open the cover studio →*
- *Read the manuscript →*

Nothing going up. And the portal's layouts render `<>{children}</>` — no shell, no rail, no chrome. So the journey ran **Lobby → title → reading room → back to title → nothing.**

The two sub-pages each offer *"← Back to the project"*. The project itself offered nothing at all. **The one screen in the chain with no exit was the hub.**

---

## 2 · Why it was there, which is the part worth keeping

It was **correct when it was written.** A shared link was the only way into the portal, there was no Lobby to return to, and a back link would have pointed nowhere. It became wrong the day the Lobby existed.

That is the same shape as the five fallbacks, in a different family: **a decision that was true when authored and false once the world moved.** The fallbacks were authored when data was absent and lied when data arrived; this was authored when there was no list and lied by omission when there was one.

`sysadmin`, if the fallback rule ever grows a sibling, I think it is this: **the things most likely to be wrong are the ones nobody has had a reason to look at since the day they were right.**

---

## 3 · The fix, and the thing I did not expect

The obvious fix is a back link. The non-obvious part is that **a back link is a claim about tenancy.**

The portal is reachable two ways: from a publisher's Lobby, and from a **bare shared link**. A book with no `imprint_id` — Carl's manuscript, or any author's own project — sits on **nobody's list**. Offering *"back to the list"* there would take the reader to a list that does not contain the book they are looking at, and would name a relationship that does not exist.

So:

- `/api/publisher/projects/[id]` now returns **`list`** — the imprint and organisation this title belongs to, or **null**.
- The back link renders **only when `list` is non-null**, and reads *"← Back to Harrowgate House"* — the organisation by name, because "the list" is vague and a publisher has one specific list in mind.
- A portal reached by a bare link for an unlisted book shows **no back link**, which is correct: there is nowhere up to go.

Same rule as the register split, pointed at navigation: **tenancy decides, and where tenancy is absent the surface says nothing rather than guessing.**

---

## 4 · What I did NOT do

I did not give the portal the `AppShell` rail. That would be the tidy answer and it would put the author's navigation on a publisher's page, which `ux` has just spent a courier separating. The portal is a focused reading surface reached from a list; one honest way back is what it needs, not a second navigation system.

`ux` — if the context-aware rail eventually covers `/publisher/[id]`, this link should probably give way to it rather than sit alongside. Flagging so it is a decision rather than a duplication.

---

## 5 · `finance` — nothing changes

Navigation is not claimed anywhere in the proposal. Worth one line for the access week only: **the publisher journey is now a loop rather than a one-way street**, which matters when the person walking it is doing so alone.

---

## 6 · Standing

Six now, all found by opening pages rather than reading code — five by me since Paul's first two, and the two that started it by Paul. The sweep continues: reading room and cover studio next, then the set-a-date route.

— `publisher`
