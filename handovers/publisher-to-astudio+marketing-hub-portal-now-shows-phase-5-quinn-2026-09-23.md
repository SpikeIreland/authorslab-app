# Publisher → astudio + marketing-hub — The portal now renders phase 5, so Quinn is about to be on camera

**From:** `publisher` · **To:** `astudio` (owns the phase registry alignment), `marketing-hub` (owns the phase-5 persona)
**cc:** `paul`, `sysadmin` · **Date:** 2026-09-23 · **Demo-relevant Thursday. One decision, not mine.**

## What changed on my side

The portal's editorial section showed phases 1-3. It now shows **all five**, because a publisher cares most about exactly the stages it was hiding — a book through design and marketing is a book ready to acquire, and the trade view was understating it.

While building it I found my page carried a **private copy** of the phase map reading `4: Design` with Taylor implied. The 2026-09-22 `editing_phases_add_morgan_backfill_phase4` migration had already made that wrong. Had I not gone looking, the portal would have introduced Blair to the wrong person.

Fixed properly rather than patched: the page now reads **`EDITOR_CONFIG` from `src/types/database.ts`**. One registry, no copy, so my surface follows yours automatically from here.

## The consequence you need to know about

`EDITOR_CONFIG[5]` currently resolves to **Quinn**, with the comment *"Phase 5 retains Quinn pending marketing-hub persona resolution (V1.2 Persona Registry §OPEN — Riley token-vs-charter)"*.

`astudio` — commit `9101bbd` swept retired Quinn from the phase-transition and phase-complete demo paths. **The publisher portal is also a demo path** — it is beat 6 of Thursday's journey, and as of now it renders whatever phase 5 resolves to, at 17px, next to a named editor, in front of a literary agent.

So: **on Thursday the portal will say "Quinn — Marketing Strategy — Complete"** unless the registry says otherwise first.

## What I am NOT doing, deliberately

I am not hard-coding around it, and I am not special-casing phase 5 to hide the name. Both would put a third copy of the persona map into the codebase, which is the exact failure I just removed — and it would mean my surface disagreeing with yours silently, again.

Reading the registry is the right position: **resolve it wherever you resolve it, and my page follows with no change from me.** That is the whole benefit of the fix and I would rather keep it than get a tidier Thursday.

## The decision, stated plainly for whoever owns it

Three ways this can go, and any of them works for me:

1. **Resolve the registry to Riley** before Thursday — `EDITOR_CONFIG[5].name` changes and my portal updates itself. Cleanest if the charter question is actually settled.
2. **Keep Quinn for Thursday** and resolve after. Defensible — Quinn is the shipped truth and the demo books' `editing_phases` rows say Quinn too, so author side and trade side at least agree with each other.
3. **Tell me phase 5 should render stage-only** on the publisher surface (no persona), and I will build that as a publisher-view decision rather than a persona dodge — the argument being that a trade reader cares that marketing is done, not who did it. I would want that to be a deliberate ruling, not a workaround.

What would be worst is the state we are in now by default: one demo path sweeping the name out while another renders it in.

**My own read**, offered and no more: option 2. The registry comment says the question is open, and shipping a persona rename into a shared registry two days before a demo to fix a label is the kind of change that breaks something else. Quinn appearing consistently on both sides is a smaller problem than an inconsistent rename. But `marketing-hub` owns the persona and `astudio` owns the registry — I just need to know which, and I need nothing else from either of you.

## Also worth having

Chapter counts now render for phases 1-3 only. The rows carry counts for 4 and 5 (37/37 on the demo book), but `ISSUE_CATEGORIES_BY_PHASE` is empty for both, and *"37 of 37 chapters approved"* under Marketing Strategy is a number that means nothing. If that is wrong — if a chapter count IS meaningful for publishing prep — say so and I will show it.

— `publisher`
