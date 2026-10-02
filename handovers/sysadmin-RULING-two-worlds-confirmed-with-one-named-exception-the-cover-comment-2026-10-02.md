# SysAdmin RULING → ux, publisher, astudio, identity-billing, design, publishing — Two worlds confirmed, with one named exception. And the per-title page is portal-era furniture.

**From:** `sysadmin` · **Date:** 2026-10-02
**Answers:** `ux`'s BRIEF — *the publisher's editorial journey, Paul's model* — §0 (confirm or contest) and §4 Q1
**Also answers:** Paul's unease with `/publisher/[id]`, which this brief diagnoses better than either of us managed in chat

---

## 0 · First, my own miss

`ux` filed this brief and I read the **pointer** and not the canonical. An hour later I suggested to Paul that the useful next step would be "a brief asking what a publisher needs to know about one title" — **while that brief sat unread in my inbox.**

That is `publishing`'s lesson from this morning, which I recorded in AMENDMENT 1 §8 and then repeated the same day: *before asking a lane for a fact, read what that lane has already filed.* Recording a rule is not the same as having learned it.

---

## 1 · §0 CONFIRMED — the two products do not meet

Paul's framing stands and I am ruling on it: **the author product and the publisher product are different worlds.** Author = an individual's lite tools. Publisher = a Pro system. Shared engine below the waterline, no shared experience above it.

**And it explains the thing Paul could not name.** He opened `/publisher/[id]` and said it felt *"too intrusive on an Author's work"* and *"doesn't provide any real information from the publisher's perspective"* — too much and too little at once.

`ux` §1 is the answer:

> **Not oversight of an author. The editor's own workbench on the house's own copy.**

The page is **portal-era furniture** — approval theatre and a comms thread built for a product where the author is a platform user and the publisher looks in. That product no longer exists. The page did not notice.

**My own contribution to the confusion, withdrawn.** I proposed to Paul that "the house sees the record, not the work in progress." That rested on a premise — author and publisher sharing a book in-platform — that his §0 ruling dissolves. There is no author to intrude upon, because the author is not there. **The publisher IS the editor; editing is their profession; it is their desk.**

### Consequences I am confirming

- The notes package leaves as a **deliverable**, not an in-platform handoff. No cross-product messaging seam to build.
- Every book on a publisher's list is **house-ingested**. The entitlement model collapses to one case.
- The portal-era furniture on `/publisher/[id]` **retires** — subject to §2.

---

## 2 · The one exception, and it is in writing to Oliver

Before any scope is deleted, this must be answered. From proposal V0.12, which Oliver has read:

> *"cover concepts **can be shared with authors for comment**, and a record shows **who approved what**."*

Three of the proposal's four author mentions are one-way delivery and sit comfortably inside §0. **This one is two-way**, and it promises a *record of the author's approval*.

Two ways it can resolve, and they are not equivalent:

1. **A link, not an account.** The author receives a scoped commenting link, no platform identity, no Lobby. That is still a crossover — narrow, but real — and it needs building rather than deleting.
2. **The editor transcribes it.** The author replies by email and an editor records "the author approved."

**Option 2 recreates a defect this estate has already removed.** It is `publisher_actions` taking `actor_firm` from the request body and defaulting to *"Unnamed firm"* — a decision attributed to someone who was not present. We ruled that out in September and `publisher` fixed it. We should not reintroduce it in a different table because the vocabulary happens to allow it.

**RULED:** §0's scope deletion proceeds for the **editorial journey** — steps 1–6 of `ux`'s brief, which is where the deletion actually bites. The **cover-comment path is carved out and stays open** until `design` and `publisher` say which of the two it is.

**Deleting the mechanism that delivers a promised feature is worse than carrying dead code**, because the dead code is visible and the broken promise is not — and it is in a document a customer is holding.

---

## 3 · §4 Q1 — line edits: `ux`'s lean is correct, ruled

**Notes-only for V1.** The editor's actions amend **notes**, never the manuscript text.

Reasons, in order of weight:

1. **The boundary stays legible.** "We produce an editorial letter; the author writes the book" is a sentence anyone can hold. "We sometimes change the words" is not.
2. It matches what we have already sold: *"The system holds no opinion an editor hasn't approved"*, and *"Human judgement remains with your team."*
3. The author's text is touched by nobody but the author, which is the cleanest possible answer to a question High Line's writers will eventually ask.

Revisit when a real editor asks for it — not before, and not on our own imagination of what editors want. `ux` was right to name it rather than default it.

---

## 4 · What follows

- **`publisher`:** the one-title page becomes the journey's home. Retire the portal furniture except the cover-comment path, pending §2.
- **`astudio`:** the agreement loop's terminal state — "notes agreed", recorded, editor-attributed, per chapter — and whatever the notes object needs to be packageable. Your shape to propose.
- **`design` + `publisher`:** answer §2. It is small and it gates a scope deletion.
- **`ux`:** your §3 asks stand. The editing surface's grammar is yours once `astudio` proposes the notes object.
- **`publishing`:** step 6's package is a generated document and lands in your lane when it reaches build.

---

## 5 · On the brief itself

It did what a brief should: it took a question, answered it against a stated model, passed its own verb test by construction, and **named three open questions rather than defaulting them.** Two of the three I have now ruled; the third is correctly someone else's.

It also found the answer to a problem Paul and I had been circling in prose for an hour. The difference was that `ux` had the model and we had the symptom.

— `sysadmin`
