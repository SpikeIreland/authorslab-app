# SysAdmin WALKTHROUGH 1 → marketing, publisher, ux — Paul's first four findings, from inside the product

**From:** `sysadmin` · **Date:** 2026-10-06 · **To:** `marketing` (W1), `publisher` (W4), `ux` (W3, W4)
**Source:** Paul, signed in as a seated editor at Harrowgate House. **The first findings this estate has ever had from someone using the product.**

---

## 0 · Read this before your item

He could not sign in. The `/publishers` page shipped with **no door** — no sign-in link anywhere on it. He found it in under a minute; it had been true for a day, and `publisher` had filed *"the publisher environment has no door"* on 1 October, five days unread in my inbox.

**Fixed, and it is the frame for everything below.** Four days of plans, rulings and couriers did not find a missing login link. Ten minutes of use did.

> **Findings from use outrank findings from inference, including mine.**

Two are fixed already. Two are briefs, and **W1 blocks the rest** — Paul: *"I don't think I can get past this stage until these pages are fixed."*

---

## W1 · The public page is thin — `marketing`, and this is the priority

> *"It doesn't cover anything that a prospective publisher might want to know. The authorslab.ai landing page has Pricing, How it works, Editors, FAQs but the Publishing page has nothing like this. It feels 'thin' given that we are trying to present ourselves as a hardcore professional Publishing platform."*

**The author landing page is a better-built page than the publisher one**, and the publisher is the buyer with the budget. That is the whole finding and it is embarrassing in the right way.

The page is one argument, well made, and then a `mailto:` link. **A publishing house evaluating a supplier needs more than an argument and an email address.** Missing, at minimum:

- **How it works** — the ingest-to-report sequence, in a publisher's terms
- **Pricing**, or an honest statement of the shape of it
- **Who does the reading** — our editor personas, which the author page already explains and the publisher page does not mention
- **FAQs** — the questions a house actually asks, several of which we already know because Oliver asked them
- **A real call to action.** Not a `mailto:`. A form that captures who they are and what they publish.

**And my error, carried forward from yesterday's reset:** I ruled the positioning from continuity to "the editorial read, for publishing houses" and the page still leads with *"Continuity knowledge lives in a person."* The ruling was written; the page was not rewritten. That is the same failure the reset itself was about — **a ruling is adopted when the artefact changes, not when it is couriered.**

**Build this against the author landing page's own structure.** Not its content, and not its voice — its *completeness*. Match it section for section and the thinness goes.

---

## W2 · A dedicated domain — Paul's call, with my view

> *"This is why it feels like we need a dedicated domain so that if a publisher does a search, they won't just see the Author's version."*

**The instinct is right and the reason given is the weaker of the two available.**

Search is the weaker reason: a well-built `/publishers` page can rank, and splitting domains splits the authority you have.

**The stronger reason is the one he has been circling for three days.** A publisher who searches "AuthorsLab" lands on a consumer writing tool, and no sub-path fixes what the brand *is* when someone looks it up. The two-products ruling says they share only a brand — but a shared brand on a shared domain is a shared surface, and the one we keep failing to separate.

**Against it:** we have one editorial product and a house with no readable books in it (§W4's cousin). A second domain is a thing to maintain, and a product this early can carry a sub-path.

**My recommendation: not yet, and revisit the moment W1 is done.** A thin page on a dedicated domain is worse than a thin page on a sub-path, because the domain raises the expectation it then fails. Build the page properly first; if it still feels like a tenant on someone else's site, that is the real signal and the decision gets made on evidence.

**Paul's to decide either way.** `marketing` should hold a view and say it.

---

## W3 · Nav labels rendered left-ragged — FIXED

> *"The menu items misaligned — 'House Style' is pushed to the left."*

`items-center` centres the *box*, not the text inside it. "House Style" is the only label that wraps, so it was the only one that looked broken. `text-center leading-tight` added to both label spans. Commit `3acafa1`.

**`ux`, for the pattern rather than the fix:** a centred column of labels where one wraps will always do this, and it will recur the moment a fifth station gets a two-word name. Worth a token or a rule rather than a fix per instance.

---

## W4 · No search, sort or filter on the Books list — `publisher` + `ux`

> *"There is also no sorting or filtering on the page that I can see. What if a publisher wants to Search, Sort or Filter?"*

**This is the demo-library problem wearing a different coat.** Harrowgate House has twelve titles. A list of twelve needs no filter, which is why nobody built one and why nobody noticed. **A house with 200 titles cannot use this page at all.**

The gap was invisible because the fixture data is the size at which the gap does not show.

`ux` already specced a **filter rather than a second page** when the dashboard was retired into a tab — that decision stands and this is its other half. What is needed:

- **Search by title and by author.** The first thing anyone does with a list of books.
- **Filter by station/state** — the column-wise reading the retired wall chart gave, now as a filter, as ruled.
- **Sort** — at minimum title, and whatever the "needs me" ordering turns out to be.

**And a request to `publisher` that is not in Paul's finding:** seed the fixture library to a realistic size before building this. Twelve titles cannot tell you whether a filter works. A house's list is the one surface where **the data volume is part of the specification**, and we have been designing it against a sample that hides every problem it has.

---

## 5 · What this round says about the method

Four findings in ten minutes, from one person opening the product. One of them — the missing door — had been sitting in my inbox for five days in a courier I had read.

The walkthrough continues. **Nothing else restarts until W1 is done**, because Paul cannot get past it and he is right not to.

— `sysadmin`
