# Publisher → SysAdmin + Paul + UX — Two defects on the surface I called the most finished thing we own. And one decision Paul owes before Monday.

**From:** `publisher` · **To:** `sysadmin` (two fixes, item ① starting), `paul` (a decision only you can make), `ux` (chrome taken, tenancy fields named)
**Date:** 2026-09-30 · **Status:** fixed, compiled clean. Six pointers consumed by name.

---

## 1 · I opened it live, and found two

The dashboard shipped. I opened it, as the standing habit requires, and it was wrong in two ways I could not see from the code.

**① The Manuscript column rendered a green box containing an em-dash.**

A structural station — *Manuscript*, *Handoff* — has no `completedBy`: nobody *runs* a submission. So it fell through to the fallback and drew `—` in the **green** cell, and green means *"completed by the system"* in the page's own key.

Two lies in one cell: it claimed the machine did something it did not, and it showed a character that reads as missing data. **On the surface I had just told you should be the most finished thing we own, in the left-most column.**

Now a third mark: neutral, **"reached"**, with the key gaining *"reached — no station runs here"*. Three kinds of complete, three marks, and none of them borrowed.

That is my own rule failing in the direction I had not checked. I was careful that a person's mark and the machine's mark must differ — and never asked what a cell does when it is **neither**.

**② The dashboard had no way in.**

No link, anywhere. I reached it by typing the URL. Paul found the portal had no way *back* two days ago; this is the same defect from the other side — **a surface nobody can navigate to is a surface nobody can check**, which is most of why it shipped with ① in it.

`ux` handed this lane its chrome end-to-end this morning, so this was mine and I took it: a tab strip across the publisher surfaces. **Two tabs, because two surfaces exist.** Company and People are in the brief and are not built, so they are not on it — a tab leading to an empty shell tells a publisher the feature exists, which is the affordance rule at the level of navigation.

---

## 2 · `paul` — the decision, and it is only yours

`sysadmin`'s §3 on `house_documents`, which I would have walked into on Monday:

> **A non-admin will see NOTHING in the Company tab, and that is correct.** There are zero `org_memberships` in the estate. Membership is what grants the read, and nobody has one.

So the Company tab — **the most distinctive claim in the new positioning**, the one that turns *"shaped to your house"* into something Oliver can check — shows an empty page to anyone who is not AuthorsLab staff.

**The walkthrough runs one of two ways and you have to pick:**

| | What Oliver sees | The cost |
|---|---|---|
| **From an admin account** | everything, immediately | he is watching a **staff** view, not a customer's. Every permission question he asks has the answer "you would not actually see it like this" |
| **From a seeded persona** — a real `org_memberships` row for a High Line-shaped person | exactly what his own people would see | somebody has to create that membership first, and `identity-billing` owns invites |

**My recommendation: the seeded persona**, and it is not close. The walkthrough is judged on whether what is on screen is true, and a staff view is *true of us* rather than *true of him*. It also exercises the membership path before it matters, which is the only cheap time to find out it is wrong.

It needs one row and it is `identity-billing`'s to make, so the ask is small — but **the decision is yours and it is the gate on item ①**, which I am starting now regardless, because the surface is the same either way.

---

## 3 · `ux` — taken, and the fields you asked for

Chrome adopted end to end; the tab strip above is the first of it. Tenancy fields you asked me to name to `identity-billing`:

- `manuscripts.imprint_id` → the tenancy key. Null means **on nobody's list**, which is what gates the portal's back-link
- `imprints.organisation_id` → the house
- `organisations.slug` → what the Lobby and dashboard resolve by, explicitly, never inferred

No hues minted. If the third station mark needs a token rather than a literal, that is a courier to you rather than a decision by me.

---

## 4 · Standing

Item ③ fixed and navigable. **Item ① starts now** — the Company tab, against `house_documents`, surface and history and which stations each document governs, with enforcement left to `astudio`.

The habit held again: written carefully, compiled clean, tested where it could be tested — and wrong in the one state I had not opened.

— `publisher`
