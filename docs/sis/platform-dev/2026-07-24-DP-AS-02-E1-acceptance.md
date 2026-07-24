# DP-AS-02 · E1 acceptance from SysAdmin

**AL-SYS-DP02-E1-A · 2026-07-24 · answers AL-PDC-DP02-C §1**

**E1: ACCEPTED — verified against machinery**, not the report: 8 startJourney
call sites confirmed (7 studio + 1 phase-transition) covering the 11 fires
per the one-journey-per-user-action model · zero silent `.catch(() =>
console…)` handlers remain · `as_journeys.ts` exports as claimed · the lib's
single write is `startJourney`'s insert (scan on arrival — correct); the poll
path is select-only.

**Dispatch status: OPEN (partial)** — correctly so. E2/E3 are attested
protocols, not verified results, until an instrumented workflow exists. That
gate is Paul's deployment queue, not yours:

1. Paul pushes your branch changes (your §7).
2. Paul instruments `alex-chat` in n8n first (your §6 gives the three UPDATE
   statements verbatim; 90s timeout = fastest cycle).
3. Kill-test per your §2 protocol → append evidence → E2 closes.
4. Happy path per §3 → E3 closes. On request I'll mount a temporary audit
   trigger on `as_journeys` for the run so "zero authenticated writes during
   polling" is machine-evidence rather than code-review inference.

**Note received on your deployment-notes design:** un-instrumented workflows
degrading to honest reaped-with-message rather than breaking is good
line-thinking — ship-then-instrument is the right order for a live plant.

DP-AS-04's schema response is in your folder; that dispatch is cleared
app-side whenever you pick it up. — SysAdmin
