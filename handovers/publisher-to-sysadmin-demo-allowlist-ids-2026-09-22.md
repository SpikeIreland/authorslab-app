# Publisher → SysAdmin — Allowlist ids, and the one distinction to get right

**From:** `publisher` · **To:** `sysadmin` · **cc:** `paul`, `ux` · **Date:** 2026-09-22 · **Demo-urgent.**
Paul ruled (b), demo-ID allowlist, over my (c). Complying — my recommendation is withdrawn. Here are the ids.

## The ids

Allowlist **both**, so demo day needs no second deploy:

```
4d0025e6-14cc-458b-a70c-f48593aff44d   # paul.lyons@authorslab.ai  — pre-flight, ACTIVE now
c037e098-2f9c-4728-8ac3-f97fb40665fc   # carl@spikeisland.tv       — Carl's copy, demo day
```

My shelf's live row points at one of these at a time via `ACTIVE_PROJECT_ID` in `src/app/publisher/_data/stable.ts`. If only one gets allowlisted, the switch to Carl's copy on Wednesday becomes a code change plus a push under time pressure — the thing Push Ceremony exists to avoid. Both costs nothing.

## The distinction — please apply the allowlist to the LIST route only

This is the part worth thirty seconds before you write it.

- **`/api/publisher/projects` (list) — allowlist it.** This is where the exposure actually lives. It hands out every manuscript id on the platform, which is what converts an unguessable UUID into a listed one. Paul's ruling closes exactly the right door.
- **`/api/publisher/projects/[id]` (detail) — leave it open by id.** Do **not** restrict this one to the two demo ids.

Why: open-by-unguessable-id *is* the invitation model, and it is the posture Paul set from the start — the founding brief describes the portal as "a page anyone with the project ID can hit". A publisher invited to a book holds its link; that is the whole design until `identity-billing` lands real accounts. If the allowlist lands on the detail route as well, then only these two books are viewable by anyone, and the first real invited publisher after the demo hits "Project not available" — the defect I spent today closing, reintroduced from the other side.

The list route was the leak. The detail route was never the leak; it was the feature.

## What I am not asking for

The three field asks from `publisher-to-sysadmin-portal-field-ask-2026-09-22.md` (`total_chapters`, `created_at`, per-phase chapter counts) are **not** demo-urgent and should queue behind this. The page renders correctly without them. Please don't let them ride along with an allowlist change that needs to land fast — and if the chapter counts do land later, the 36-vs-37 discrepancy still wants settling first.

## Status on my side

Portal verified in production from a signed-out browser before this ruling arrived: API 200, book renders, editorial status Complete / Complete / Complete, no console errors. The comms thread now derives from `phase_status` and carries no chapter counts, so it can no longer contradict the page — committed, awaiting Paul's push.

Nothing on my side blocks your allowlist work.

— `publisher`
