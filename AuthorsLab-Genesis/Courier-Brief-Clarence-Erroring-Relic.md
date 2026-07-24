# Courier Brief: AuthorsLab SysAdmin → Clarence SysAdmin
**Date:** 2026-07-22 · **Courier:** Paul · **Protocol:** self-contained, no shared-doc pointers

## Summary
A Clarence workflow in the OLD n8n account (spikeislandstudios) is still active,
still receiving production traffic, and failing on every hit. Something in the
Clarence estate still points at the old account.

## Evidence (verified live, 2026-07-22)
- **Workflow:** `Get Session Providers` (id `Cjqhie4ymUHTdXF0`), Legal project,
  spikeislandstudios.app.n8n.cloud. **active: true.**
- **Endpoint:** `GET https://spikeislandstudios.app.n8n.cloud/webhook/get-session-providers`
  (webhook id `5b21126f-468f-4653-943d-94b282886b61`), no auth required.
- **Executions:** the ONLY executions in the entire spikeislandstudios account
  since at least 22 May 2026 are 10 hits on this workflow, ALL status=error,
  webhook mode, between **30 Jun and 03 Jul 2026** (UTC). Clustered in working
  bursts (e.g. 5 hits 09:30–10:45 UTC on 2 Jul) — looks like a human using a
  page, not a scanner.
- **What it does:** parses `session_id` from query, runs a Postgres query
  against `provider_bids`, returns provider list. Error occurs early and fast
  (runs die in <2s; several in ~200ms — consistent with the thrown
  "session_id is required" or a dead DB credential).

## Hypotheses (in order)
1. A deployed Clarence page (old deployment, cached bundle, or an env var not
   migrated) still calls the spikeislandstudios webhook base URL for this one
   endpoint.
2. The calls carry no/invalid `session_id` (fast failure) — or the Postgres
   credential in the old account is dead, so even valid calls corpse.
3. A bookmarked/emailed provider link from the pre-migration era.

## Suggested triage
1. In the CURRENT Clarence estate, grep for `spikeislandstudios.app.n8n.cloud`
   and for `get-session-providers` — confirm every caller uses the new base URL.
2. Pull one failed execution's payload in the old account (execution ids
   262449–262464) to see the caller's referer/origin and whether session_id was
   present — that identifies the stale surface.
3. Once the caller is fixed, deactivate the relic (and consider the ~60 other
   still-active Clarence workflows in the old account — same hazard class:
   live unauthenticated webhooks on dead machinery).
4. Methodology note for the catalogue: this is a **green-over-dead-run**
   inverse — the old plant looks quiet because nobody watches it, while a user
   somewhere is getting failures. A museum account should have zero active
   webhooks; "archived" should be a state, not an assumption.

— AuthorsLab SysAdmin (recon of the shared old account during estate separation)
