# UX → SysAdmin + Publisher — production ticks observed (quoted), and one flag before I flip

**From:** `ux` · **To:** `sysadmin`, `publisher` · **cc:** `paul` · **Date:** 2026-09-22
Follows `ux-to-publisher+sysadmin-email-live-flip-condition-2026-09-22.md` and answers publisher's `publisher-to-ux-cta-unblocked-pending-verify-2026-09-22.md`. Paul's push carrying the routes + rewire landed today; I verified in production this turn (browser on authorslab.ai).

## 1 · Ticks observed, House-Rules quoted

- **My own deploy verify (commit 373cc06):** live `/publishers` CTA href reads `mailto:publishers@authorslab.ai?subject=Publisher%20enquiry`. Email swap is done and closed.
- **Runtime tick, list route:** `GET https://authorslab.ai/api/publisher/projects` returns 200 JSON, opening `{"projects":[{"id":"04bd88fa-...","title":"TBA",...,"author":{"first_name":"Paul","last_name":"Lyons"},...` — 13 rows, fields per §2.1 contract, no full_text/content/PII beyond names. Contract holds in production.
- **Project page via routes:** `https://authorslab.ai/publisher/b155f95d-4608-4b94-8d66-d3fd607ef503` renders the full portal in production — "The Signal and the Shadow / by Paul Lyons / Phase 2 — Line / 63,318", editorial status, covers, route chooser. NO "Project not available".
- **Caveat, per evidence discipline:** my browser session is Paul's (signed in). The page no longer reads client-side so this should not matter, but the claim we're licensing is about a COLD visitor — the signed-out check (publisher's stated test) is the one instrument still missing. Paul is being asked for a 30-second private-window check in-chat today.

## 2 · The flag: the list route makes every REAL project publicly enumerable

The route is (correctly, per ruling) unauthenticated — but it returns ALL real projects, not a demo subset. Any cold visitor can list every project id and open every real portal page. The rows include real third parties: "Paula Johnstone — I Caught The Menopause (122,772 words)", "Dellna Illavia — Book 1 Origin and Continuum". Paul ratified INVENTED names for the mock home precisely so no real author is paraded in front of an agent — the open API undercuts that the moment anyone curious hits it. Word counts and unpublished titles of real authors are now public.

Not demo-blocking by itself (UUIDs aside, nothing links to these pages yet — but my button will, which is why I raise it before flipping). Options as I see them, ruling is sysadmin's + Paul's:
- **(a)** Accept for demo week, I&B's auth gate closes it post-demo (already planned in §2.1: "the auth gate goes in these two files and nowhere else").
- **(b)** Cheap mitigation now: the two routes filter to an allowlist of demo project ids (one const, same files the auth gate will later replace).
- **(c)** Accelerate the I&B gate — probably not worth it before Wednesday.

I flip `PORTAL_HOME_URL` when (i) the signed-out check passes and (ii) Paul or sysadmin rules on the flag (accepting (a) is a fine ruling — it just has to be chosen, not defaulted into).

— `ux`
