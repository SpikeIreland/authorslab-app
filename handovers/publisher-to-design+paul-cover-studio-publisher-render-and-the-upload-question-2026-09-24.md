# Publisher → Design + Paul — The publisher's render of your studio, and an upload question I did not answer myself

**From:** `publisher` · **To:** `design` (owns the studio), `paul` (decision in §3) · **cc:** `sysadmin` (§3 touches write posture)
**Date:** 2026-09-24

## 1 · What I built, and what I did not touch

Paul's model for the two-sided product is **one shared surface rendering differently per party**. I have built the publisher's render: `/publisher/[projectId]/cover`.

It reads **your** assets through my service-role route and **your** selection column. It does not generate, does not compose, does not write to `cover_assets`, and does not touch the Design tab. The only thing it adds is the act a publisher performs and an author does not: deciding.

- Every concept at size, the author's selection marked *"Author's choice"*
- **Click any concept to flip the large view** — Paul's ask, so a publisher can hold two directions against each other before committing
- **Full jackets get their own row at 2:1.** My covers route gained `?include=all`: the portal's approval row still shows portraits only (a jacket cropped into a 2:3 frame reads as broken) but the studio shows the jacket properly, because it is a real deliverable a publisher wants to see
- Approve / request revisions / note the designer

**Session-only, and the page says nothing otherwise.** There is no publisher-approval row and no publisher-notes table, so nothing claims you have been notified. When those exist the component writes to them and the copy earns the claim. This is the same posture as the reading room.

This is the seam you offered to pair on post-demo. It is now built on your side of the glass, which should make that pairing concrete rather than abstract.

## 2 · Your overwrite caveat, and how I would dodge it

Your contract §2.1 flags that `storage_path` is not unique — `<manuscript>/cover-<index>.png`, upserted, so a regeneration run overwrites objects in place while rows accumulate.

If publisher upload is built, it should write to a **distinct namespace** — `<manuscript>/publisher-<uuid>.<ext>` — which generation will never produce and therefore never clobber. That sidesteps your caveat entirely for uploaded assets rather than inheriting it, and it stays correct after the composer build gives everything unique paths.

I have not built it, for the reason below.

## 3 · The upload question — Paul's call, and I want it made deliberately

Paul asked for publisher upload of self-generated images. I stopped short, and the reason is not effort.

**An unauthenticated write endpoint is a different risk class from an unauthenticated read.** Everything I have shipped on this surface reads: the exposure of getting it wrong is that someone sees a book they shouldn't. An open upload means **anyone who has a project id can put a file into the storage bucket** — arbitrary content, arbitrary volume, attributed to the publisher, sitting in the same bucket as real artwork. The portal is deliberately open until `identity-billing` lands (Paul's ruling, correctly), and that ruling was made about reads.

So: **the seam where upload belongs is the same seam the I&B auth gate goes into**, and building the write before the gate inverts the order.

Three ways forward, all fine by me:

| | Approach | For the demo | Risk |
|---|---|---|---|
| A | **Don't build it today.** Carl answers "yes, a publisher can bring their own artwork" in a sentence | No live upload | None |
| B | Build it behind an env flag, off in production, on for a rehearsal environment | Demonstrable off-camera | None in production |
| C | Build it open, accept the exposure until I&B lands | Live upload on camera | A stranger with a project id can write to the bucket |

**My recommendation is A for today and B as the real answer**, with the upload landing properly once there is a publisher identity to attribute it to. Uploading is a "can it?" question, and a sentence answers it as well as a live drag-and-drop — whereas an open write endpoint is the kind of thing that is discovered later and is nobody's favourite discovery.

`design` — if you would rather own the upload path entirely, since it writes to your table and your bucket, say so and I will build only the publisher-side UI against whatever route you expose. That may well be the cleaner division.

## 4 · One thing I would like from you when there are days rather than hours

Approval as a distinct state, which we already agreed: author-selected ≠ publisher-approved. Your strawman anchored it to `cover_versions`, and I think that is right. The shape I need from the publisher side is small — who approved, when, and against which version — plus the note thread alongside it, so that "approved" is a record rather than a colour on a button.

— `publisher`
