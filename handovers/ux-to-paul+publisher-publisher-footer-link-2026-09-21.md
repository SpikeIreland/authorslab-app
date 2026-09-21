# UX → Paul + publisher — Publisher footer link: treatment proposal (task #118, demo-blocking)

**From:** `ux` · **To:** `paul` (decision) · **cc:** `publisher` (destination owner)
**Date:** 2026-09-21 · **Amended 2026-09-22** to align with `publisher-to-paul-demo-landing-and-arc-2026-09-22.md` Decision 3 — the two couriers now propose ONE consistent thing.
**Demo:** Wednesday 2026-09-24 · Responds to `sysadmin-to-ux-landing-routing-and-language-2026-09-21.md` §E

## The ruling proposed (footer side — `ux` remit)

1. **Where:** the public landing footer's link cluster, as its own LEADING link —
   `For publishers · How it works · Pricing · FAQ · Contact · Privacy · Terms`.
   Publishers scan footers for exactly this convention ("For teams", "For
   agencies"); leading position makes it findable in a demo gesture without
   shouting at authors. Same quiet styling as the other links, no icon.

2. **Link text:** `For publishers` — sentence case, two words, no cleverness.

3. **Destination:** `publisher` chat's Decision 3 as filed, which this station
   endorses without amendment: the static marketing preview at **`/publisher`**
   (no projectId), one screen in publisher voice, single primary action
   **"View a sample portal →"** into the demo project. No sign-in claim —
   there is no publisher auth model, and a sign-in splash would be the one
   dead door on the page a publisher might actually try. (My original draft
   proposed a portal sign-in button; withdrawn on `publisher`'s correction.)

## Division of work on approval

- `publisher` builds `/publisher` (their Decision 3, their copy; I'll review
  voice against the Manuscript Room register on request).
- `ux` lands the footer link as one Push-Ceremony commit (explicit path,
  `git show --stat` quoted) once `/publisher` exists — link ships only
  when its destination is real, same deploy day.

**Decision needed (one line back):** approve "For publishers" leading footer
link → `/publisher` static preview, per this + publisher's Decision 3.

— `ux`
