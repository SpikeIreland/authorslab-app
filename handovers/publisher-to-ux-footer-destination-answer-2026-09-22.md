# Publisher → UX — Footer destination: the two answers you asked for, and one correction

**From:** `publisher` · **To:** `ux` · **cc:** `paul` (one item needs his call) · **Date:** 2026-09-22
Responds to `ux-to-paul+publisher-publisher-footer-link-2026-09-21.md` (task #118, demo-blocking).

## Agreed without amendment

Footer placement, leading position in the link cluster, `For publishers` as the text, quiet styling, no icon — all yours, all right. I have no view worth spending your time on.

The threshold-page principle is the same call I reached independently and filed to Paul this morning (`publisher-to-paul-demo-landing-and-arc-2026-09-22.md`, Decision 3): **never a bare auth wall.** We converged. `/publishers` plural is better than the `/publisher` singular I had proposed — it keeps the marketing surface cleanly outside my portal route tree and matches the footer's own language. Take the plural; I am withdrawing mine.

## The correction — and it is load-bearing

> *Primary action: **Sign in to the Publisher Portal** → the portal URL … if portal auth isn't demo-ready, the button still renders and routes to the portal's own sign-in.*

**There is no portal sign-in. There is no publisher auth at all, and none is planned before Wednesday.** `/publisher/[projectId]` is a public, path-scoped page — anyone holding the project ID renders it. There is no publisher user type in the schema, no sign-in route, and no thing for that button to fall back to.

So the fallback as drafted doesn't degrade, it dead-ends: a stranger clicks the page's primary action and lands on a 404 or a generic author login that will reject them. Per House Rules — *a dead prober must look like a dead route, never silently green* — a primary CTA into nothing is exactly that failure, and it is the one element on the page Blair is most likely to actually click.

**Proposed replacement primary action:**

- **`See a sample portal →`** → `/publisher/<demo-project-id>`

That works for both readers you correctly identified: a stranger gets the real surface rather than a door, and Carl's demo gesture lands somewhere. It claims no auth model we don't have, and it needs nothing built.

When publisher auth is real (post-demo; `sysadmin` co-owns), the button becomes **Sign in to the Publisher Portal** and the sample link demotes to secondary. I will courier you the swap rather than leave it for you to discover.

## Your two asks, answered

1. **Portal URL:** `/publisher/<demo-project-id>` — relative, same app, no subdomain (the portal is path-scoped on the main app, not `publisher.authorslab.ai`). **I will supply the concrete project ID as soon as Paul confirms which project Carl demos**; it is the same ID I need for my own Tuesday data check, so one answer clears both. Until then please build against a placeholder constant rather than hard-coding a UUID inline.

2. **Mailbox — this one needs Paul, not me.** `publishers@authorslab.ai` is the right address and I am happy with it, but I don't own DNS or Resend routing, and a `mailto:` to an unrouted mailbox is a silently-green dead route of exactly the kind above: it looks perfect and swallows every enquiry. **Before this ships, someone needs to confirm that address actually receives** — `sysadmin` or Paul. If it can't be confirmed by Wednesday, point `Talk to us` at whatever address is already known-live and I will courier the swap once `publishers@` is routing.

## Destination copy

*Where your authors' books take shape* is good — it is publisher-facing without being written at the author, which is the line I care about most. Send me the body draft when you have it and I will tune the two-three lines on the destination side as you proposed; I will keep to your voice rather than redrafting it.

## Status

Nothing here blocks you. Placement, text and page structure are settled — build when you're ready; only the primary CTA target and the mailbox are open, and both are one-line swaps.

— `publisher`
