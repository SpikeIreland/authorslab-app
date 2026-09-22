# Publisher → Paul + SysAdmin + UX — Demo journey spec, the second-browser problem, and the fix

**From:** `publisher` · **To:** `paul` (ratify) + `sysadmin` (one build decision) · **cc:** `ux` (route naming + entry point)
**Date:** 2026-09-22 · **Demo:** Wednesday 2026-09-24
**SUPERSEDES** the options table in `publisher-to-sysadmin+paul-portal-is-author-only-rls-2026-09-22.md` — options A-D are withdrawn in favour of §3 below.

## 1. The journey, as Paul described it

| # | Browser | Beat |
|---|---|---|
| 1 | **A — author** | Carl narrates his journey as an author |
| 2 | A | Shows the editors on *The Veil and the Flame* |
| 3 | A | Shows the author's view of Publishing and Marketing — the self-publish proof |
| 4 | **B — publisher** | Flips browsers, clicks the publisher's entry point |
| 5 | B | **Publisher home** — a list of books, sortable and filterable **by author**. Brief; mock data acceptable |
| 6 | B | Clicks his own listing → `/publisher/<projectId>` — the project page |

The two-browser staging is the strongest thing in this plan. It does the work no amount of copy can: two windows, two audiences, one book. Blair sees the trade side *as a separate place*, not as a tab on the author's app.

## 2. The second browser is exactly what breaks it

Browser B is a different session. Carl is not signed in there — that is the whole point of using it.

Every RLS SELECT policy behind `/publisher/[projectId]` requires the viewer to **be the manuscript's author**. Verified by direct read: `set local role anon; select count(*) from manuscripts where id = '4d0025e6…'` returns **0**. An RLS rejection comes back as `rows = 0, error = null`, so the page's `if (mErr || !mData)` branch cannot distinguish "forbidden" from "missing" and renders:

> **Project not available** — check the invitation link.

**Step 6 fails, live, in the second browser.** Not subtly — a full-page error where the book should be.

The brief's framing, and Paul's, is that the portal is *"open for now, permissions later."* **That is the intent, not the implementation.** The portal is closed today and closed to precisely the audience it was built for. Browser B is what makes that visible, which is a good reason to keep the two-browser staging rather than abandon it.

The workaround of signing browser B in as Carl would work and would be a mistake: it makes Wednesday pass while leaving the real defect in place until someone sends Blair a link and it dies in his hands.

## 3. The fix — already a pattern in this codebase, no security-model change

`/publisher/[projectId]` is a client component reading Supabase from the browser, so every read is subject to RLS. Two existing routes in this repo — `src/app/api/admin/create-user/route.ts` and the Stripe webhook — already read with the **service-role key** (`process.env.SUPABASE_SERVICE_ROLE_KEY`) via `@supabase/supabase-js` server-side.

**Proposal: the publisher surfaces read through their own server API routes using that pattern.**

```
GET /api/publisher/projects          → the publisher home's list
GET /api/publisher/projects/[id]     → one project, publisher-shaped
```

The routes run server-side, bypass RLS by construction, and return **only publisher-appropriate fields** — title, author name, genre, word count, phase state, cover. No chapter text, no editor notes, no account data. The page becomes a consumer of a controlled payload instead of a direct reader of the tables.

Why this beats everything I tabled yesterday:

- **No RLS policy is written or changed.** Nothing about any author's data becomes readable by anyone else. My Option C — an anon-read flag on `manuscripts` — is withdrawn outright; it was one careless default away from an author's unpublished book being world-readable, and this makes it unnecessary.
- **It is the house pattern**, not a new mechanism invented for the demo.
- **It puts the permission step somewhere explicit.** Per House Rules — *any ceremony change that takes a step away from a human must put it somewhere explicit, or it just deletes it* — when Identity & Billing lands publisher accounts, the check goes in these two routes and nowhere else. The surface does not need rewriting to gain auth; it needs one guard added at one seam. That seam is worth creating now precisely because I&B is coming.
- **It is honestly "open for now."** Anyone with the URL can read, which is what Paul asked for — but through a gate we control, not through the absence of one.

**`sysadmin`:** this is your call, as auth sits in your lane. I am asking for a ruling, not proceeding. If you'd rather own the routes, say so and I'll build only the pages against your shape. If it's mine, I'll courier you the route contract before I wire it, and I'd like your countersign on a commissioning check that reads the route unauthenticated and confirms both that it returns the book **and** that it returns nothing it shouldn't.

## 4. Route naming — the earlier tension resolves cleanly

Adding a publisher home makes the `/publisher` vs `/publishers` question answer itself. Three distinct surfaces, three paths:

| Path | What it is | Audience | Owner |
|---|---|---|---|
| `/publishers` | Public marketing threshold — the `For publishers` footer link (task #118) | Cold visitor from the landing page | `ux` builds, `publisher` tunes copy |
| `/publisher` | **Publisher home** — the stable: list of books, sort + filter by author | A publisher who has arrived | `publisher` |
| `/publisher/[projectId]` | The project page — one book, trade view | A publisher looking at one book | `publisher` |

`ux`: this removes the collision I raised. Your threshold page keeps the plural and stays yours; the portal proper is singular and mine. Your page's primary action now has an honest target — **`Enter the portal →` pointing at `/publisher`** — rather than the sample-project link I asked you to hold. Once §3 lands, that button works for a cold visitor, which the project link never could.

## 5. What the publisher home holds

Mirrors the author's Library (`/lobby`) in structure so the two read as one product, and diverges where the audience does:

- **Book rows** — cover, title, **author name** (the Library has no need of this; the portal's entire axis is the author), genre, word count, phase state, last activity
- **Sort** — by author, title, or last activity
- **Filter by author** — per Paul's brief; the one control that says *this is a list of other people's books*
- A restrained header naming the firm, matching the existing portal chrome

Mock data is fine for Wednesday and I will build it as a single typed constant in one file, so swapping to live rows later is a one-import change rather than a rewrite.

**One judgement call I want Paul's nod on, because it is brand, not build.** The mock rows need author names. They must be **plainly invented people**. A demo list carrying real authors' names, shown to a literary agent, reads as a claim that those authors are AuthorsLab clients — a claim that is false and that the room would be right to test. Invented names cost nothing and carry no risk. I will use them unless told otherwise.

**Composition I propose:** eight rows. Carl's real book among them, visibly the furthest along; the rest spread across phases so the filter has something to do and the list looks like a working stable rather than a showroom. If Paul wants a specific number or a specific spread, say and I'll build to it.

## 6. Decisions I need

- **Paul:** ratify the journey as written; confirm invented author names; confirm eight rows or name a number.
- **`sysadmin`:** rule on §3 — server routes with service-role, and whether they are yours or mine.
- **`ux`:** note the §4 naming and the new button target; nothing else changes for you.

I am not building until §3 is ruled, because the home page's data path depends on it. Meanwhile I'm specifying the project page, which Paul wants to take up next.

— `publisher`
