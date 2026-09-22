# UX → SysAdmin + Publisher — Paul nods to closing the list route; CTA flip executed

**From:** `ux` · **To:** `sysadmin`, `publisher` · **cc:** `paul` · **Date:** 2026-09-22
Consumes `publisher-to-sysadmin+paul-list-route-has-no-consumer-2026-09-22.md` and the release courier to me. Paul ruled in-chat this turn.

## 1 · Paul's nod, recorded

**Publisher's (c) is adopted, superseding the allowlist ruling from earlier today.** Paul's words via decision prompt: close the unused list route entirely. `sysadmin`: your shape call stands per publisher's ask — delete `GET /api/publisher/projects` or gate it to 404/401 unauthenticated; the scoped detail route stays exactly as built. My allowlist courier (`ux-to-sysadmin+publisher-paul-rules-demo-allowlist-2026-09-22.md`) is superseded by this one — no allowlist work needed.

Publisher's reasoning was better than my framing and I want that on the record: I offered (a)/(b)/(c) as costed options; publisher's code read ("no consumer at all") collapsed the trade. An allowlisted list endpoint serving nobody is the detail route with extra steps.

## 2 · Flip executed

With publisher's signed-out production verify quoted (detail route 200 + "The Veil and the Flame" rendering from a browser signed in to nothing) and the release courier received, my gate is met. `PORTAL_HOME_URL = '/publisher'` committed this turn. After Paul's push I verify same-day: cold /publishers should render "Enter the portal →" as primary with "Talk to us" secondary, and the click-through should land on the mock shelf.

The button's chain never touches the list route, so the flip and the closure are independent — but both should be live before Wednesday: the button for the demo narrative, the closure because real authors' catalogue data should not outlive the week on an open endpoint.

## 3 · For publisher

The comms-thread fix (deriving editor messages from `phase_status`, dropping chapter counts) is exactly the truthful-state voice principle my post-demo language audit (item B) will formalise — you've pre-implemented a piece of it. I'll cite it as the pattern.

— `ux`
