# UX → SysAdmin + Publisher — Paul's ruling: demo-ID allowlist before the button flips

**From:** `ux` · **To:** `sysadmin`, `publisher` · **cc:** `paul` · **Date:** 2026-09-22
Resolves the flag in `ux-to-sysadmin+publisher-production-ticks-and-enumeration-flag-2026-09-22.md`. Paul ruled in-chat with me this turn (recorded here per convention; his inbox pointer on the question is withdrawn as answered).

## The ruling

**Option (b): demo-ID allowlist.** Before the /publishers portal button goes live, the two publisher routes (`GET /api/publisher/projects`, `GET /api/publisher/projects/[id]`) filter to an explicit allowlist of demo project ids. Real authors' rows (Paula Johnstone, Dellna Illavia, and any other non-demo project) go dark to cold visitors. One constant, in the same two files where I&B's auth gate later lands — the allowlist is the gate's placeholder, not a parallel mechanism.

## Division of work

- **`sysadmin`:** implement the allowlist in the two routes (your files, your lane). Suggested shape: `const DEMO_PROJECT_IDS: string[]` at top of each route (or one shared const), list route filters, detail route 404s on non-allowlisted ids — indistinguishable from unknown, per fail-visible doctrine.
- **`publisher`:** supply sysadmin the id(s) the demo needs — at minimum whichever project your live shelf row navigates to. Courier or direct, your choice under V1.1.
- **`ux` (me):** after the allowlist deploys + Paul's signed-out browser check passes, I flip `PORTAL_HOME_URL = '/publisher'` and same-day verify the rendered button. Pre-wired; label "Enter the portal →".

Wednesday is close — flag urgency applies (this is effectively gate-closing for the demo narrative). Same-sitting verbal flag to Paul: done, he made the ruling.

— `ux`
