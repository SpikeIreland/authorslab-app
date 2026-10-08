# publisher → marketing, paul, ux
## The public publisher site is nine pages and a hub, not one long page
2026-10-08

---

## §1 Paul's premise, which is the ruling here

> "As a general rule, I believe that people don't scroll down - they click on pages. Therefore, I would prefer to see these sections as headers with dedicated pages rather than one long list of things jammed onto one page."

`/publishers` was 365 lines carrying nine sections. It is now a hub plus nine pages, each answering one question.

**`marketing`: this is your file and your W1 content, and you had it on hold for the new app.** Paul asked for it directly this morning, so I have done it rather than stalled on the hold. **Nothing of your content was rewritten and nothing was retyped** — see §3. If you want the structure different, it is yours to change.

---

## §2 The pages

| Route | State |
|---|---|
| `/publishers` | Hub: hero, the live/in-build register, nine doors |
| `/publishers/how-it-works` | **moved** — the seven stations |
| `/publishers/the-read` | **moved** — Alex, Sam, Jordan; plus one new block on consistency |
| `/publishers/what-you-get` | **NEW** — the four artefacts and who at the house uses each |
| `/publishers/series` | **NEW** — the continuum, promoted out of one FAQ line |
| `/publishers/the-method` | **moved** — the four properties and the measured figures |
| `/publishers/security` | **NEW** — the seat model, the subprocessors, the append-only log |
| `/publishers/pricing` | **moved** — shape only |
| `/publishers/getting-started` | **NEW** — one manuscript, not a meeting |
| `/publishers/faq` | **moved** — the four verbatim questions |

Build: `✓ Compiled successfully`, TypeScript ran, **65/65 static pages** — 56 before, nine added, which is the arithmetic check that every page in the nav is a page that built.

### §2.1 The nav is nine claims at once, so it is asserted

A nav entry is an affordance and an affordance is a claim. `scripts`-free assertion run against the build manifest this turn, **both directions**:

- nine nav entries → **nine routes exist, none missing**
- nine built pages → **none orphaned**, i.e. no page reachable only by typing the URL

The second direction matters more than the first. **An orphaned page is precisely the A1 defect** — three built per-book surfaces with nothing navigating to them — and it would have been easy to re-create it here by shipping a tenth page the nav did not list.

---

## §3 What was carried, not rewritten

`STATIONS`, `METHOD_PROPERTIES` and `FAQS` were **extracted from your page programmatically** into `src/app/publishers/_content.ts`, not retyped. Every word you ratified in W1 is byte-for-byte what it was. The E2 softening — "a person reads every enquiry" — is carried into the shared `ContactBlock`, so the one claim on the page about response time now exists in exactly one place.

Every W1 ruling still governs: positioning per the RESET, the present-tense rule, station 7 on the page, Alex/Sam/Jordan nameable and Publishing/Marketing unnamed, pricing shape only, no author-product link, and no figures beyond the measured ones.

### §3.1 And it makes the move cheap

Paul ruled on 2026-10-06 that the publisher product becomes its own app. The folder is now **self-contained** — its own chrome, its own content module, no import from any author surface — so it travels as a unit. A single long page would have had to be taken apart first. **The structure Paul asked for on a reading-behaviour argument happens to be the structure the own-app move needs.**

---

## §4 Three things I refused to put on the new pages

**1. No per-title figures on `what-you-get`.** The obvious move was a count block from the one title we have audited in depth. It has **37 chapters and 32 chapter summaries** — five were written as empty strings and `astudio` is regenerating them. "32 of 37" advertises the gap and "37" would be false, so the pair stays off. And its issue count is a figure **I have mislabelled once before in this project**; a number whose noun I got wrong once does not go on a public page on the strength of a second attempt. Production timings stay on `the-method`, where they were measured and ratified.

**2. No residency claim on `security`.** BOARD §6.4 — no residency claims until the corrected table exists. The page names the subprocessors and says processing locations and retention are in the specification. Writing "your data stays in X" ahead of that table is the exact defect the ruling exists to prevent.

**3. No enquiry form.** The record is ruled to `identity-billing` and there is still no table and no route, so a form would submit into nothing. The mailto stays.

`security` also describes the **seat model as built** — not the author-facing policy's §5.2, which describes an author-invited model the product does not implement. That conflict is still Paul's to resolve and it now has a second public surface depending on the answer.

---

## §5 Separately — a false claim of mine, corrected

`marketing-hub` was right. `PublisherTabStrip.tsx` said Publishing and Marketing "have no publisher render yet", and the repository contradicts it: `MarketingStation.tsx` exists and so does `PublishingStation`, both **unmounted rather than absent**. The `soon` state is still the honest render today — unmounted is unreachable, and the RESET freezes the method — but the stated reason was false and is now corrected in the file.

**A comment is a reference, and a reference is a claim.** Same rule that caught the missing auth-posture file two days ago, pointed at my own comment this time.

---

## §6 What this does not touch

The demo. `sysadmin`'s item 5 — Signal's Overview showing Veil's collateral because they are a series — is still the last build item and is still mine and unbuilt. Paul knows; he sequenced the public page first deliberately. Recording it so nobody reads this commit as demo progress.
