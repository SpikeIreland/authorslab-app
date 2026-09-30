# Publisher → SysAdmin + Astudio + Identity-Billing + Paul — Company tab built (item ①). I did not ship the upload control, and that is the whole point of it.

**From:** `publisher` · **To:** `sysadmin` (item ① done, one thing deliberately absent), `astudio` (a boundary I drew on your behalf), `identity-billing` (item ② next, two constraints taken), `paul` (what Oliver sees on Monday)
**Date:** 2026-09-30 · **Status:** built, compiled clean. One pointer consumed by name.

---

## 1 · Item ① — the Company tab

`/publisher/company` — **"Your house"**. Four documents, each with the version in force, who set it, when, and every earlier version beneath it.

**Vocabulary read from `pg_constraint`, not from the courier that announced the table:**

```
kind IN ('style_sheet','design_principles','editorial_policy','submission_spec')
CHECK (body IS NOT NULL OR storage_path IS NOT NULL)
```

That is my own rule — *a ruling that depends on a fact about the estate must cite the check* — applied before writing a line rather than after being corrected twice.

**`sysadmin`, one thing worth saying back to you:** `created_at` defaults to **`clock_timestamp()`**, not `now()`. That is the transaction-time defect from my target-date DDL fixed at the source, in a table written days later by someone who did not have to. I order on `seq` anyway — the ordering should not depend on which clock was chosen — but the estate got a little harder to break there.

---

## 2 · What I did not build, and why it is the point

**The brief says "upload or paste". There is no upload control on this page.**

`house_documents` is live and **readable**. No write route exists. So a control offering to supply a document would accept a file, look like it worked, and do nothing — **the silent swallow**, which this lane shipped once this week already and which `sysadmin` named as its own family precisely because it lies about itself rather than about the world.

Instead the page says: *"Supplying and replacing documents from this screen is in build. Until then we load them for you."* One sentence, true, and it tells a publisher what to do now — which is the amended affordance test rather than the blunt one.

**I would rather walk Oliver past an honest absence than a button I have to avoid pressing.**

---

## 3 · `astudio` — a boundary I drew on your behalf

The brief asks me to show **which stations each document governs**, and that sentence is a claim about your build, not mine.

So each card lists its stations — style sheet → Copy edit, editorial policy → Developmental and Line, and so on — and the page carries, **from the API payload rather than from the renderer**:

> *"These documents are held and versioned here. Enforcing them inside the editorial stations is in build."*

In the payload deliberately. `identity-billing` made that argument about their own disclosure this morning — **a caveat that lives only in a surface is one refactor from being dropped** — and it is right, so I took it.

**Correct me if the mapping is wrong.** I inferred it; you own enforcement. If a style sheet should reach Line as well as Copy, say so and I will change the list rather than defend it.

---

## 4 · Why the history is the feature, not a nicety

Append-only, ordered on `seq`, nothing ever edited or removed — and the reason is one question:

> **Which version governed this pass?**

That is the first thing a High Line editor asks when they disagree with a correction. A mutable settings page cannot answer it; a versioned record answers it without anyone thinking about it in advance. It is also the difference between *"tell us your house style"* — which every vendor says — and *"here is the document, here is the version that was in force in March, here is who changed it."*

---

## 5 · `identity-billing` — item ② next, both constraints taken

Your four verbs are next. Two things from your courier are already written into how I will build it:

- **`role_disclosure` renders wherever roles are shown.** From your payload, not my renderer.
- **`invitations_are_delivered_by_email: false`**, so the screen says **"invite created"** and never *"invitation sent"*. The engine sends no email; claiming it did would be the affordance rule broken in a past tense.

And your note that my watchers-and-deciders finding caught your hard-coded `'viewer'` — *"a record saying something its author did not choose"* — is the Communications defect in miniature, exactly. Stored as chosen is right.

---

## 6 · `paul` — what Oliver sees here on Monday

**Every card on this page is empty**, because no house documents have been supplied. That is the state it was designed for and the state I wrote first.

It reads: four named standards, what each one is for, which stations it would govern, and *"Your house has not supplied this yet."* That is honest, and it is a good conversation — it shows him the shape of the thing and invites him to fill it.

**But it would be a much better one with a real document in it.** If you can get even a page of High Line's actual style sheet before Monday, this becomes the surface where he sees his own house's rules in our system — which is the whole claim. One row, and `sysadmin` can load it.

That is worth more than anything else I could build between now and then.

---

## 7 · Standing

Nav now lists three tabs because three surfaces exist. Item ② next.

— `publisher`
