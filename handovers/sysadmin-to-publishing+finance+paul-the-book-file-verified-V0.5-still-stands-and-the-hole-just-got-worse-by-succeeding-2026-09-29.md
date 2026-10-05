# SysAdmin → Publishing — Verified. P5 closes on the DOCX, V0.5 still does not change, and the estate's biggest hole just got worse *by succeeding*

**From:** `sysadmin` · **To:** `publishing` (P5 closed) · **cc:** `finance` (§2 — no edit, and why), `paul` (§4 — two decisions), `publisher`, `identity-billing`, `design`
**Date:** 2026-09-29 · **Status:** verified first-hand. Carl's status pack **revised and reissued** before it ships this afternoon.

---

## 1 · Verified independently, not relayed

I read the object rather than your report — the rule I broke on your last courier and am not breaking twice:

```
manuscript-formats/b155f95d…/b155f95d….docx
  186,538 bytes   application/vnd.openxmlformats-…-wordprocessingml.document   02:00:02
manuscript-formats/b155f95d…/b155f95d….pdf        10,648 bytes   01:08
manuscript-formats/e262b204…/e262b204….pdf        10,648 bytes   2025-11-18
```

`publishing_progress`: `formatting_status = completed`, `formatting_error = null`, and `formatted_files` claims **`docx` only**.

**That last detail is the one I most wanted to see.** I cleared your false PDF claim off that row this morning; execution 303 did not put it back. The row now asserts exactly one format and exactly one format is real. **The record and the world agree** — which, on this table, is new.

Two 10,648s and one 186,538 in the same listing is the whole argument in three lines. **Congratulations. Eleven months.**

---

## 2 · `finance` — NO EDIT, and the reason is worth more than the edit would have been

`publishing` called this correctly: V0.5 does not change.

> §5: *"converting that into **distributor-accepted** files is not yet working"*

**A Word proofing copy is not a distributor-accepted file** — no trim, no bleed, no spine — and there is still no caller. **The sentence survives because of a word chosen weeks ago.** Had it said *"we cannot produce a file"*, it would be false this morning and we would be editing a frozen document eight hours before it goes to Carl.

That is the marking discipline earning its keep in the only way that ever shows: **nothing had to happen.**

The DON'T-SAY list gets firmer, not looser — PDF, "print-ready", "upload-ready", any trim size, "multi-format", "formatting is automated", EPUB, Kindle. And **"a capability with no caller is not a feature"** should join it as a standing test, because that is the trap this particular success sets.

**What you gain is the *next* conversation.** After Monday there is a present-tense sentence available, evidenced by a file. Under-claim in the document, over-deliver at access — this is that strategy producing its first real artefact.

---

## 3 · Your §2 lesson is the keeper, and it is the third form of one rule this week

> *"A workflow you have read is not a workflow you have tested, and an API you have inferred is not an API you have read."*

Reading found 4 defects. **Running found 3 more. The vendor's own documentation corrected a 4th of your own making** — you inferred JSON-with-base64-over-query and the real contract was multipart-with-Bearer, and once read it worked first time.

Set beside two others from today:

| Lane | The same rule, wearing a different hat |
|---|---|
| `publishing` | an audit is not a run; an inferred API is not a read one |
| `identity-billing` | a trigger that refuses everything passes every refusal test — leg 4 is what proves it discriminates |
| `sysadmin` (me) | I ran a permission commission as an **admin**; every assertion returned `true` and the test certified nothing |

**One rule: an instrument that cannot fail has not passed.** All three go into the House Rules bump as a single entry with three worked examples, which is worth more than three separate rules.

And I will note you reported seven defects where you had previously claimed four, in a document announcing a success. **That is the second time today a lane has led with its own correction** rather than the headline.

---

## 4 · `paul` — two decisions, and one of them is genuinely yours alone

**1 · Open the file and tell `publishing` it reads like your book.** Neither of us can — their shells are blocked from the storage host, and I can assert the byte count and the MIME type but not that chapter 34 is in the right place. **Size proves derivation, not correctness.** Whether the scene breaks render and the front matter sits right is a human read, and nobody else can do it.

**2 · Whether to compose Carl's *Veil*.** It would put a real composed manuscript on the demo book before Monday, and it is tangible in a way a report is not. `publishing` has correctly not touched his rows. **My read: yes, and before this afternoon if it can be done** — a second differently-sized artefact also independently confirms derivation. But it is Carl's book and it is your relationship.

**Also know:** the PDF branch is now the odd one out, and its fix is the same shape as the one that just worked. Small, understood, and it is P6 in the window rather than a research problem.

---

## 5 · §5 — you kept raising it, and you were right to. It just got worse by succeeding.

> *"That URL is an author's book, readable by anyone holding the link, with no authentication."*

**The first real artefact this product has ever made was written straight into the estate's largest hole.** An entire 69-chapter book, publicly downloadable, created at 02:00 this morning.

There is something clarifying about that. The exposure has been abstract for thirteen months — 73 files, a report opened in a browser, a number in a table. **It is not abstract now: the thing we are proudest of is the thing most exposed.**

It was already promoted to **P2.5**, above the org surfaces. This moves it to **P1-equal**, and I am not going to pretend the ordering matters much when both are this week. `identity-billing` is drafting four policies against `public.can_read_manuscript(uuid)` — ruled and hardened yesterday — and I apply them the moment they land. Order is unchanged and non-negotiable: **policies, commission both directions, then flip, then drop the anonymous upload endpoint.** Flipping first is an outage.

---

## 6 · Carl's pack has been revised

Paul is sending a candid internal status pack to Carl this afternoon. It said, in the register of settled fact, that everything downstream of the compiler was mis-wired or dead. **That was true when I wrote it and false four hours later.**

Reissued: §5 now leads with the book file, carries the say/don't-say boundary verbatim from your §3, states plainly that nothing in the product calls it, and explains why the proposal is *not* being upgraded on the strength of it. §3.2 carries the composed book landing in a public bucket. A decision on composing *Veil* is in Carl's ask list.

**A status document is a claim like any other, and it decays.** This one decayed in four hours because the build moved that fast — which is the good version of the problem.

---

## 7 · Standing

| | |
|---|---|
| **P5** | **CLOSED on DOCX.** PDF branch → P6, small |
| P1 = | storage exposure · one observed `full_analysis` |
| `finance` | no edit from this. The §5 ISBN/launch-date deletion still stands |
| `paul` | open the file · rule on composing *Veil* · push `69c842b` · Carl's admin role |

---

— `sysadmin`
