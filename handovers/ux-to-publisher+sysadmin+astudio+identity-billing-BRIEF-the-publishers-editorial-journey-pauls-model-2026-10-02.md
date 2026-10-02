# UX → Publisher + SysAdmin + AStudio + Identity-Billing — BRIEF: the publisher's editorial journey. Paul's model, and the ruling that frames it.

**From:** `ux`, carrying Paul's model as stated to me in-chat 2026-10-02 · **To:** `publisher`, `sysadmin`, `astudio` · **cc:** `identity-billing`, `publishing`, `paul` · **Date:** 2026-10-02
This is the brief sysadmin asked for — "what does a publisher need to know about one title, and which publisher?" — answered as a QUESTION PUT TO A MODEL rather than a spec. Paul has put the same question to `publisher`; this courier and their answer should converge, not compete.

## 0 · Paul's framing ruling, stated first because everything follows from it

> **The two products are entirely different worlds. They never actually meet.** The author product is a 'lite' version — an individual author's personal publishing tools. The publisher product is a Pro system.

We have all been assuming a crossover exists. Paul's view: there is none. Consequences, each worth its own check:

- **The publisher's authors are not platform users.** The notes package (§2, step 6) leaves the platform as a DELIVERABLE — a document sent to the author — not as an in-platform handoff. No cross-product messaging seam exists or needs building.
- **The author-shares-a-book-with-a-publisher case may simply not exist.** The invitation-portal story was the pre-pivot product. If Paul's ruling holds, every book on a publisher's list is HOUSE-INGESTED, the entitlement model collapses to one case, and `/publisher/[id]`'s remaining portal-era furniture (approval theatre, comms thread) has no referent. `sysadmin`/`publisher`: confirm or contest — this deletes real scope.
- **Engines still shared, below the waterline.** "Never meet" is about EXPERIENCE. One Craft Call Cell, one Alex lineage, one schema — the operating-model ruling stands untouched. The products are two applications of one engine, invisible to both kinds of user.

## 1 · What the publisher's one-title page is FOR

Not oversight of an author. **The editor's own workbench on the house's own copy.** The publisher IS an editor; editing is their profession; the system multiplies their output and decides nothing.

## 2 · The journey, as Paul stated it

1. **The house ingests a manuscript** (the author emailed it in; the editor loads it). Substrate: `publisherMayIngestInto()` — already on I&B's near path; the demo's "he may add a title and watch it parse" is this step.
2. **"Read the Manuscript"** — the author product's "Read MY Manuscript", third person. Same three engine runs (full review, chapter summaries, key points), voice resolved per R8. No new workflows: a voice parameter through the one lineage, explicitly as ruled.
3. **"Start Editing"** — Alex's chapter notes, third person. The demo's pre-generated notes on CS The List are this step already built.
4. **The agreement loop** — the editor discusses the notes with Alex until they agree; the conversation refines the notes, with **House Style** (live at /publisher/company) as Alex's standing brief for the house's conventions. This is the step that speeds the workload: days to hours per manuscript, with the editor deciding every line of the notes.
5. **The agreed notes become the chapter's FINAL NOTES** — recorded, attributed to the editor (the by-hand mark exists for exactly this).
6. **The notes PACKAGE** — the assembled editorial letter, sent to the author as a document. The product's native output artifact: the author product outputs a finished manuscript; the publisher product outputs an editorial letter.

**Verb test, passed by construction:** Alex prepares and surfaces; the editor checks and decides; the system records and hands off; the author writes. No system verb from the forbidden list anywhere in the flow.

## 3 · What this asks of each lane (asks, not orders)

- **`publisher`:** the one-title page becomes this journey's home — state line + strip at top, "Read the Manuscript" / "Start Editing" as the primary actions on ingested titles, notes state visible per chapter. The portal-era furniture retires as §0 confirms.
- **`astudio`:** the engine already serves steps 2–3 (R8 + pre-generated notes). New: the agreement loop's terminal state — "notes agreed" as a recorded, editor-attributed event per chapter — and whatever the notes object needs beyond today's chapter notes to be packageable. Your lane's shape to propose.
- **`publishing`:** step 6's package is a generated document — your compiler/format lane when it reaches build.
- **`identity-billing`:** nothing new — ingest permission as already planned; step 5's attribution rides memberships.
- **`ux` (me):** the editing surface's grammar — same MECHANICS as the author studio (chapter list, notes panel, conversation), different chair: the editor's actions amend NOTES, never the manuscript text, and the terminal control reads "Package notes for the author", not "Complete phase". I spec this against astudio's notes-object shape once they propose it.

## 4 · Open questions, named rather than defaulted

1. **Line edits on the house's own copy?** Traditional editors line-edit. V1 lean (mine): notes-only — the boundary stays legible, ships sooner, and the author's text is never touched by anyone but the author. Revisit when a real editor asks.
2. **Does the shared-book/portal case survive at all?** (§0.) If yes, it is the through-glass view and nothing more; if no, scope dies cleanly.
3. **Package form** — letter-only, or notes-inline-with-manuscript? Owned by `publishing` when it reaches them.

— `ux`, carrying Paul's model
