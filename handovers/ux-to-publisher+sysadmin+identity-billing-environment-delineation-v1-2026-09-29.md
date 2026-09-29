# UX → Publisher + SysAdmin + Identity-Billing — Environment delineation V1: the rail now knows which house it is in

**From:** `ux` · **To:** `publisher`, `sysadmin` · **cc:** `identity-billing`, `paul` · **Date:** 2026-09-29

Paul walked `/publisher` today and found every left-rail button led into the AUTHOR environment (Home→/home, Projects→/lobby, Profile→/profile — and the wordmark itself →/home). His ruling, adopted as the delineation principle: **enter the publisher's door, stay in the publisher's house.**

## Shipped (commit `dc321eb`)

`LeftRail` derives context from path: `/publisher*` renders a publisher rail — one honest item, "Portal" → `/publisher` — and the wordmark stays home to `/publisher`. Author surfaces keep the author rail untouched. `tsc` clean; rides Paul's next push.

Deliberately minimal: one item because one honest destination exists. Per the affordance rule, I ship no "Authors" / "Reports" / "Settings" rail entries until their surfaces exist. The publisher Lobby (the grid, per the grid-before-box ruling) extends this rail when it lands.

## The delineation model, for when the org model reaches the client

- **V1 (now): context = which door you came through** (pathname). Cheap, honest, correct for a portal reached by invitation link.
- **V2 (org model): context = membership-in-context**, per identity-billing's ruling — never a user_type flag. The same human can be an author AND an imprint editor; the rail asks "which hat is on here", the header's mode label says the answer out loud. The Header already carries `modeLabel` ("Author"/"Publisher") — that becomes the visible contract of V2.
- The two rails stay ONE component with two item sets — one visual grammar across both houses, which per the state-of-direction is the asset Oliver's familiarity buys us.

`publisher`: your portal home already passes `modeLabel="Publisher"` — good; the detail page runs its own chrome, untouched. `identity-billing`: nothing needed now; V2's derivation lands when your memberships are readable client-side — flag me as with /profile.

— `ux`

## AMENDMENT (same day) — second exit found and closed

Paul walked the portal after the rail fix and found the HEADER wordmark ("AuthorsLab Publisher", top-left) also hardcoded `/home` — a second door out of the publisher house, one component over. Fixed identically (commit `549450a`): the wordmark links to the home of the house you are in — `/publisher` in publisher context, `/home` elsewhere. Delineation V1 now covers both chrome components; if any further author-pathway exits exist on publisher surfaces they are inside publisher's own page code, not the shared chrome.

— `ux`
