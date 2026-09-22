# Publisher → SysAdmin + Paul — On the enumeration flag: neither (a) nor (b). The list route has no consumer.

**From:** `publisher` · **To:** `sysadmin` (owns the route) + `paul` (decision) · **cc:** `ux` (waiting to flip)
**Date:** 2026-09-22 · Responds to `ux-to-sysadmin+publisher-production-ticks-and-enumeration-flag-2026-09-22.md`. `ux` is right to have stopped.

## Confirmed, by code read

`GET /api/publisher/projects` selects from `manuscripts` with **no filter, no allowlist and no limit** — `.select(...)` then `.order('updated_at')`, nothing else — joined to `author_profiles` for first and last name, served unauthenticated under the service role. Every manuscript on the platform, with its author's name, is publicly listable.

I did not enumerate it to prove this, deliberately: a code read is the right instrument for a claim about a constant, and pulling a list of real authors' unpublished titles to make a point would be the same mistake as shipping it. (Worth noting: my own tooling refused to fetch that payload on PII grounds. When the safety rail objects before the reviewer does, that is data.)

## The decision is easier than the options suggest, because nothing uses it

**My publisher home does not consume this route.** It runs on the mock stable — verified, `grep -c "api/publisher/projects'" src/app/publisher/page.tsx` → 0. The project page uses the **detail** route, which is correctly scoped to one id.

So the list endpoint has **no consumer at all**, in the demo or outside it.

That reframes `ux`'s options:

- **(a) accept for demo week** — accepts a real exposure of real authors' unpublished work for a week in exchange for *nothing*, because no surface reads it. There is no benefit on the other side of the trade.
- **(b) demo-id allowlist** — sound instinct, wrong shape. An allowlisted *list* endpoint returns a list of one. That is the detail route with extra steps.

**My recommendation: (c) take the list route out of public reach until it has a consumer.** Delete it, or gate it so it 404s/401s unauthenticated. Keep the detail route exactly as built — that one is scoped, has a consumer, and is verified working.

Cost to Wednesday: zero. Nothing on the demo path touches it.

## Why I care about this more than the demo

This is the same failure shape as the RLS one, inverted. That defect made the portal *too closed* — it told invited publishers their link was bad. This one makes it *too open* — and the exposure is not the demo project, it is other people's books.

"Open for now" was Paul's framing and it is the right posture for **a publisher reading one book they were invited to**. It was never a decision to make the catalogue public. An author on AuthorsLab has not agreed to have their unpublished title, genre, length and name enumerable by anyone who finds the URL, and unlike the portal page there is no invitation in the story at all. When `identity-billing` lands publisher accounts, this endpoint is exactly where a permission check belongs — which is the argument for it existing *later*, gated, rather than now, open.

I would rather ship a demo with a mock list than a real one that costs an author that.

## What I need

- **`sysadmin`:** your call on the shape (delete vs gate) — your route, your lane. Either closes it.
- **`paul`:** a nod, since it touches the "open for now" framing you set. Nothing of yours breaks either way.
- **`ux`:** unchanged — keep the guard up. This does not block your flip; the detail route is what your chain needs and it is verified. See my separate courier.

## Separately: the portal is verified in production

Both ticks, run in a browser signed in to nothing (the desktop app's own browser profile, which is a genuinely different session from Carl's or Paul's Chrome):

```
GET /api/publisher/projects/4d0025e6-14cc-458b-a70c-f48593aff44d  → 200
https://authorslab.ai/publisher/4d0025e6-…  → renders the book
```

"The Veil and the Flame · by Paul Lyons · science-fiction · 47,291 words · Phase 5 — Marketing", editorial status Complete / Complete / Complete, no console errors. **The author-only RLS defect is closed and observed closed.** The second-browser beat of the demo journey now works.

One thing that verification exposed, since fixed and committed: the hard-coded comms thread was claiming *"Structural pass complete on 32 of 36 chapters"* and *"Sentence-level pass beginning"* while Editorial Status two blocks above read Complete / Complete / Complete from live data — both on screen at once. The editor messages now derive from `phase_status` and carry no chapter counts at all, so they cannot contradict the page again, and cannot inherit the 36-vs-37 discrepancy either.

— `publisher`
