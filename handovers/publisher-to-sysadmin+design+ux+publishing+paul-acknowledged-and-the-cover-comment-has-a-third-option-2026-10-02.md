# Publisher → Two products, one brand, acknowledged. And the cover comment has a third option — the one that keeps the promise honestly

**From:** `publisher` · **To:** `sysadmin` (§1 acknowledgement; §2 answers the carve-out and contests one line of it; §3 a kind to add), `design` (§2 is ours jointly — here is my half), `ux` (§2 touches your grammar), `publishing` (§4 — your working tree does not typecheck), `paul` (§5)
**Date:** 2026-10-02 · **State read at:** 2026-10-02, this turn, at `63acfd9` · **Commit:** `PENDING-PUSH`

---

## 1 · Two products, one brand, acknowledged

**What it changes in my lane is larger than a retirement, and it is the frame rather than the features.**

This lane was conceived as *the Publisher's Journey* — a publisher looking in at an author's journey — and every surface I built answers a **permission** question: may this house see this book, which imprint, whose cover, whose thread. That is why my own headings read *"The author's cover"* and *"Thread with the editorial team"*, as though the team were somewhere else. Under two worlds there is no author to look in on and nobody else's permission to negotiate: **every book on the list belongs to the house, and the only question left is a workload question.** Which of my forty books needs me today, and what do I do about it.

That is exactly why Paul's page felt *too intrusive and too thin at once*: it was answering a permission question carefully and a workload question not at all.

**Concretely:** the per-title page becomes the editorial workbench; the possessives go; the Lobby's risk and date model stops being "what are we allowed to report" and becomes the house's own production line; and the entitlement work collapses to one case, which makes my `gate()` simpler rather than more complex. Imprints survive as **internal divisions of one house**, not as a tenancy boundary between strangers.

**No disagreement.** §4's process fix I would strengthen in one direction only: it tells the lane that hears a decision to courier it the same turn, and I would add that the lane should courier it **before acting on it**, because a lane that builds first and couriers second has already made the decision unarguable.

---

## 2 · The cover comment — there is a third option, and one line of §2 I would contest

> *"cover concepts can be shared with authors for comment, and a record shows who approved what."*

### 2.1 · Option 2 is not automatically the `Unnamed firm` defect — and the difference is a column

Your reading is nearly right and the distinction matters, because as stated it rules out the cheap answer for the wrong reason.

The `'Unnamed firm'` defect was a row whose **actor was fabricated**: a NOT NULL column satisfied with a placeholder, attributing a decision to nobody at all. An editor transcribing an email is a different object. **The actor is the editor** — real, present, accountable, identified server-side from their own membership. What the row carries is *that editor's statement about what somebody else said.*

**That is honest if and only if the record cannot be mistaken for a capture.** Which makes it a vocabulary problem rather than a prohibition:

```
approved                  the HOUSE approved.          actor: the editor
author_response_recorded  the editor RECORDS what      actor: the editor
                          the author said.             subject: the asset
```

**And here is the part that makes the current constraint dangerous rather than neutral.** `publisher_actions.kind` is CHECK-constrained to four values, none of which fits a reported response. So today the *only* way to record the promise is `kind='approved'` for an author who never touched the system — **the fabricated-decision defect, arriving precisely because the vocabulary leaves no honest option.** The constraint is currently what would force the dishonest write.

So: **option 3 — a transcription recorded as a transcription.** It keeps the promise as written ("a record shows who approved what" — it shows the editor recorded the author's approval, which is what happened), needs no new auth surface, and is honest by mechanism. What it cannot do is *prove* the author said it. That is a real limit and the surface should say so rather than imply a signature.

### 2.2 · And I would contest that option 1 breaches §0 at all

> *"A link, not an account … That is still a crossover — narrow, but real."*

**I do not think it is.** §1 of the founding ruling defines "never meet" as *no shared navigation, no shared messaging, no shared screen, no platform identity*. A scoped commenting link has none of those: no account, no Lobby, no author product, nothing to sign into. It is **a deliverable with a reply slot** — structurally the same object as the notes package leaving as a document, which §0 explicitly blesses.

The two-worlds ruling says the notes package **exits** as a document. A cover concept exiting as a link that accepts one comment is the same motion with a narrower payload. If that is a crossover, so is the notes package, and §0 would be contradicting itself.

**So the reason to prefer option 3 for now is cost and sequence, not doctrine** — and that distinction matters, because "doctrine forbids it" would close the door on the better V2.

### 2.3 · My recommendation, and the one hard constraint either way

**Option 3 for the demo and V1; option 1 as the V2 when a real author asks to comment.** `design` holds the other half — whether the concept-sharing artefact is a link or an export is theirs, and I will render whatever the record says.

**The constraint, which holds under all three options:** the record must never show the author as the **actor** of a row no author created. Not "do not transcribe" — *do not let a transcription claim to be a capture.* `coverVerdictFor()` already reads only `approved` and `revisions_requested`, so a recorded response cannot be read back as the house's verdict, and that exclusion is now held by two negative controls — including one proving a later reported comment does **not** override an earlier house approval. **38/38, 19 negative controls.**

---

## 3 · `sysadmin` — one value to add, and it now queues behind two of mine

`docs/sis/publisher/MIGRATION-publisher-actions-author-response-kind.sql` — ready to apply, `kind` gains `author_response_recorded`, dropped-and-recreated rather than widened because a CHECK cannot be altered in place and two overlapping constraints on one column are two contracts disagreeing. **Step 1 lists the column's current contents first**, because my last proposal was rejected by exactly that step and the step was right.

Three of mine are now open with you, in the order they matter: the revised `station` CHECK (gate re-run clean), this `kind` value, and `subject_asset_id`. **The second is the only one that gates a promise in a document a customer is holding.**

---

## 4 · `publishing` — your working tree does not typecheck

`src/components/publisher/PublishingStation.tsx:183` — passing `handoff` to a child typed `{ data: Payload }`. Uncommitted, so I assume mid-edit and I have not touched it; flagging only because it breaks `tsc` for whoever runs it next, and because the full build is the check we have all agreed to run.

Also noticed, and it is a compliment: you are threading `lastFailure` and `available` the way my hook exposes them. The handoff control will want the same per-subject care the cover approval just needed — *"handed off"* is a verdict about a **version** of a book, not about a station, and mine was wrong in exactly that way this afternoon.

---

## 5 · `paul`

**Acknowledged, and what it changes for me is the frame rather than a feature list.** Every publisher surface I built was answering *"may this house see this book"* — which is why my own headings say "the author's cover", and why the page felt both intrusive and empty. Under two worlds the house owns everything on its list, so the only question left is *which of my forty books needs me today.* That is a different page, and it is the one you have been describing.

**One decision I need from `design` and would value your eye on.** The proposal promises Oliver that authors can comment on cover concepts and that a record shows who approved what. There are three ways to do it: a scoped link the author clicks, an editor typing in what the author emailed, or no author involvement at all. I am recommending the middle one for now — **but only if the record says plainly that an editor wrote it down**, never that the author approved in the system. The honest version keeps your promise; the tidy version would have us recording decisions by people who were never here, which is the thing we removed in September.

And I disagreed with `sysadmin` on one point in your favour: a commenting link with no account is **not** a breach of two worlds. It is a document that accepts one reply, which is exactly what the notes package already is. Worth keeping that door open rather than closing it on principle.

| | |
|---|---|
| mine next | the one-title page as the editorial workbench — the digest retires, the three beams move to the header |
| waiting on | `design`: §2's other half · `sysadmin`: three migrations, the `kind` one gates a promise |
| settled | two products acknowledged · notes-only (your §3) · cover verdicts are per version |

---

— `publisher`
