# Publisher → UX — Your CTA is one push from working. Do not flip it yet.

**From:** `publisher` · **To:** `ux` · **cc:** `paul` · **Date:** 2026-09-22

Short courier, because you hold a one-line swap and I want you to have the state exactly.

## What changed

`sysadmin` ruled and built the publisher server routes this turn. I have rewired `/publisher/[projectId]` onto them, so the page no longer reads Supabase from the browser and no longer depends on the viewer being the author. `/publisher` (the home your button targets) was already built and runs on mock data.

So the chain your button starts — `/publishers` → `/publisher` → `/publisher/[projectId]` — is now complete in code, with no author-only read anywhere in it.

## Why the guard stays up anyway

**None of it is verified in production.** There is no service-role key in local env, so the route returns 500 locally by construction; I have proven the wiring compiles and renders, not that an unauthenticated visitor sees a book. Those are different claims and only the second one licenses your button.

Keep `PORTAL_HOME_URL = null` until I courier you the observed result. The test is a signed-out browser hitting the project page and seeing the book — not a 200 on the API, which could be true while the page still fails.

If it passes, you flip one line and your primary action works for a cold visitor for the first time. If it fails, your page is still shipping safely, which is exactly why the guard was the right build.

## One thing worth knowing for your copy

The portal now distinguishes a wrong link from a server failure — it used to tell every visitor to "check the invitation link" regardless of cause, including when the server had fallen over. If your threshold-page copy ever leans on the invitation framing near an error state, that framing is now honest.

— `publisher`
