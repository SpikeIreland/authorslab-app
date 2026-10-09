# SysAdmin BRIEF → marketing, ux, astudio — The free analysis works and ends in a dead end. Three things, then it opens.

**From:** `sysadmin` · **Date:** 2026-10-09 · **Called by:** Paul — a real author is waiting to try it.

---

## 0 · Where it actually stands, measured

**Built and working:** `00.04 Free Manuscript Analysis` is **active** in n8n. The Craft Call retrofit landed — four stages, each with its own ledger station (`alex.free-analysis.structural`, `.character`, `.thematic`, `.synthesis`). Email goes over Resend SMTP from `editors@authorslab.ai`, with the from-address matched to the SMTP identity so it will not fail DMARC. PDF attaches. Content swaps and DOCX support done.

**Switched off:** `FREE_ANALYSIS_ACTIVE = false`. The page has rendered "opening this week" since the gate went up before an ad ran, and was never flipped back.

**Never proven:** the smoke test is the one task in this estate still open *from before the gate*. The last workflow change was 21 September. **Nothing has gone through it since.**

> A path that has never been exercised in production is not known to work, however carefully each of its parts was built.

**Unbuilt, and it is the point of the whole thing:** there is no sign-up CTA anywhere. I grepped the page. The flow ends with an emailed PDF and stops.

---

## 1 · Done this turn, mine — the preview door

`?preview=1` renders the real form, on the real deployment, posting to the real webhook. Everyone else still gets "opening this week".

Deliberately not a secret and not a security boundary — it hides a form from casual traffic and nothing more. **It is removed in the same commit that flips the gate**, and that removal is the definition of this being finished.

---

## 2 · `marketing` + `ux` — the confirmation screen is the first thing to fix

What a person sees today after submitting their manuscript:

- A green box with a **✅ emoji** and `text-6xl`
- *"Complete Manuscript Analysis Submitted!"* in `text-4xl font-bold text-green-900`
- A blue inset box with a **📧**
- One button: **"Return to Home"**

None of it is on brand — no ivory, no sage, no serif, nothing from the token set every other surface uses. It predates the design system.

**And the only action offered is to leave.** This is the moment a stranger has just handed us their book and is most interested in us, and we send them to the homepage.

**`marketing` owns the copy and the offer. `ux` owns the surface.**

Two constraints from me:

**Nothing may claim what has not happened.** *"within 15 minutes"* is a promise nobody has measured since the retrofit — the smoke test produces the real figure, and the copy uses that or an honest range, exactly as the author studio does now.

**The CTA is an invitation, not a close.** They have had something free and good; the next step is an account, not a checkout. `marketing-hub`'s pricing language applies and nothing about urgency or discounting does.

---

## 3 · `marketing` + `astudio` — the email is the stronger CTA and it has none

The confirmation screen is seen for ten seconds. **The report is read properly, later, with attention** — and that email currently ends with the PDF.

That is the better place for the invitation, and it is a different surface from §2: the screen catches people who are curious, the email catches people who have read their own assessment and want more.

**`marketing` writes it. `astudio` lands it in the workflow's email body**, which is already flagged in the workflow's own history as unchanged pending MKT-006 alignment. Same two constraints as §2.

**R8 applies**: this reader is an author, and the voice is the author voice. The free analysis is author-side and nothing about it touches the publisher product.

---

## 4 · The order, and nothing jumps it

1. **Smoke test** — Paul, through `?preview=1`, on a real manuscript. It produces three things nobody currently has: whether it works at all, the true turnaround figure, and a report to read.
2. **§2 and §3** — in parallel, once the copy has a measured number to use.
3. **Flip the gate and delete the preview door**, in one commit.

**The gate does not flip before step 1 passes.** An author arriving at a form that fails is worse than an author told "next week" — and Paul has already said he will manage that expectation, which is the cheapest thing in this whole brief.

---

## 5 · Not in scope

The publisher product. The demo. Both frozen tracks stay frozen. This is author-side work for an author-side visitor, and it is here because a real person is waiting rather than because the freeze has thawed.

— `sysadmin`
