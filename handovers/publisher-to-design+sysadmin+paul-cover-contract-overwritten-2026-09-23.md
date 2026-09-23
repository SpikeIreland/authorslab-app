# Publisher → Design + SysAdmin + Paul — The cover contract has been overwritten on the demo book

**From:** `publisher` · **To:** `design` (owns the contract), `sysadmin` (data lane), `paul` (demo-affecting)
**cc:** `ux` + `astudio` (the lobby change is in one of your lanes — see §2) · **Date:** 2026-09-23 · **Demo-affecting, not demo-blocking.**

## 1 · What I observed

Verifying the portal against Carl's book in a signed-out browser, the cover section rendered:

> *"3 concepts are with the author. Once they choose one, it arrives here for your approval."*

That is false. Carl's book has a chosen cover. Read from the database just now:

```sql
select selected_cover_url from publishing_progress
where manuscript_id = 'c037e098-2f9c-4728-8ac3-f97fb40665fc';
-- /covers/the-veil-and-the-flame.jpg
```

Yesterday that column read `cover-asset:151cc3e8-deec-431a-84c1-87972192ff33` — I quoted it in my own courier and `design` declared it as contract V1. It has since been overwritten with a bare static path, so every reader that honours the contract now resolves **no selection**.

## 2 · Where it came from, and why it is nobody's carelessness

Commit `5d08f07` — *"lobby: 'Pick up where you left off' … Carl's Veil & Flame cover added; BookCover guards non-renderable cover schemes"*. It added `public/covers/the-veil-and-the-flame.jpg` and pointed the column at it so Carl's book card would show a cover on the shelf.

That is a completely reasonable thing to want. The problem is structural, not personal: **`publishing_progress.selected_cover_url` has two readers with incompatible grammars.** The Lobby wants a URL it can put in an `<img>`; `design`'s contract says the column carries `cover-asset:<uuid>`. `publishing` predicted this exact collision in §7 of their surfaces courier and called it a post-Wednesday tidy — reasonably, since it was a *reading* hazard then. It has now happened as a *write*.

Three writers exist. Two write bare URLs:

- `src/app/publishing-hub/page.tsx:259` — legacy hub
- `src/components/CoverDesignerPanel.tsx:106` — via `PublishingContentPanel`
- `src/app/api/projects/[id]/design/cover/route.ts:80` — `design`'s route, the only one writing the token

## 3 · The fix order matters, and a naive restore makes it worse

The tempting fix is to set the column back to `cover-asset:151cc3e8-…`. **Please don't do that first.** It would restore my portal and `design`'s tab and break Carl's Lobby card on the beat where he opens his shelf — trading one broken surface for another, on camera.

The column's declared grammar is the token. So the ordering is:

1. **The Lobby resolves the token.** Whoever owns `5d08f07` (reads like `ux` or `astudio`) teaches the shelf's cover read to recognise `cover-asset:<uuid>` and resolve it to a signed URL — the same resolution `design`'s assets route and my covers route already do. The static file can stay as a fallback for books with no assets.
2. **Then restore the column** to `cover-asset:151cc3e8-deec-431a-84c1-87972192ff33`. One row, `design`'s or `sysadmin`'s call whose hand does it.
3. **Post-demo:** the two bare-URL writers get retired or migrated, per `publishing`'s §7. Until they are, this can recur — any pass through the legacy hub or the cover designer panel silently reverts the contract.

If step 1 cannot land before Thursday, my honest recommendation is to **leave the column as it is** and let the portal show its unresolved state (below). A working shelf and a portal that says "check with design" is a better Thursday than a broken shelf and a tidy portal.

## 4 · What I changed on my side, and the general point

My route treated an unparseable value as "nothing selected". That is defensible by the contract and it is what produced a **confident falsehood**: the portal told a publisher the author had not chosen, about a book where the author had.

The route now distinguishes the two and the page says so — *"The author has chosen a cover, but it isn't resolving to one of these 3 concepts. Check with the design team before approving."* Committed `ba16b0a`, awaiting Paul's push.

The general point, and the reason I am writing it up rather than just patching: this is the third defect in this surface from the same family. The portal told invited publishers their link was bad when RLS refused the read. It reported server failures as bad invitation links. Now it reported a broken contract as an unmade decision. Every one was a reader collapsing *"I can't tell"* into a specific, confident, wrong answer. Worth naming as a house pattern — **a reader that cannot resolve a value must say so, not pick the most convenient meaning** — because it has now cost us three separate bugs and each one was invisible until someone loaded the page and read the words.

## 5 · What is verified on the demo book

Everything else on `/publisher/c037e098-…`, signed out, no console errors:

- *The Veil and the Flame*, **by Carl Lyons**, 47,291 words, **Chapters 37**, Phase 5 — Marketing
- **Invited by author on 12 August 2026** — `created_at` shipped and rendering
- Phases 1-3 each **"37 of 37 chapters approved · Complete"** — the counts shipped, and the 36-vs-37 discrepancy is gone
- Thread derives from `phase_status` and reads correctly for a finished book
- Wraparound jacket correctly excluded from the concept row

The three field asks are confirmed live. Thank you.

— `publisher`

---

## AMENDMENT — 2026-09-23: step 1 is `sysadmin`'s, not "whoever owns 5d08f07"

§3 hedged on ownership — *"whoever owns `5d08f07` (reads like `ux` or `astudio`)"*. Paul has confirmed: **the Lobby is `sysadmin`'s surface.** The commit is authored by Paul himself, which is why the git log did not resolve it and why I should have asked rather than inferred from the subject line.

This is exactly the silent mis-delivery Convention V1.3's pointer-resolution rule exists to catch: an action addressed to a guess reaches nobody, and each chat that reads it assumes the other is acting. Correcting it rather than leaving it to be noticed.

**Step 1 is therefore assigned to `sysadmin`:** teach the Lobby's cover read to resolve `cover-asset:<uuid>` to a signed URL, as `design`'s assets route and my covers route already do, keeping the static file as the fallback for books with no assets. Steps 2 and 3 are unchanged, and the ordering still stands — **do not restore the column before the shelf can resolve the token**, or Carl's Lobby card breaks on the beat where he opens his shelf.

`ux` and `astudio`: no action for either of you on this. Your pointers were written on my mistaken inference; disregard the ownership line in them. The finding itself is unchanged and still worth your knowing, since the two bare-URL writers (`publishing-hub:259`, `CoverDesignerPanel:106`) can silently revert the contract from any surface that touches them.

— `publisher`
