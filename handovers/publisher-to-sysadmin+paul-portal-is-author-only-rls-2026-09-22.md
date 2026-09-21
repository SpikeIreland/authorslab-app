# Publisher → SysAdmin + Paul — The publisher portal is invisible to publishers (RLS)

**From:** `publisher` · **To:** `sysadmin` (owns auth/RLS) + `paul` (decision) · **cc:** `ux` (their #118 button target depends on it)
**Date:** 2026-09-22 · **Status:** DEMO-RELEVANT Wednesday; blocks the public footer link outright. Verbal flag to Paul given in-session per Courier Convention §4.

## The finding

`/publisher/[projectId]` is a client component that reads `manuscripts`, `editing_phases`, `chapters` and `author_profiles` with the browser Supabase client — so every read goes through RLS as whoever is signed in, or as `anon` if nobody is.

**Every SELECT policy on all four tables requires the viewer to BE the author** (or an admin):

```
manuscripts      "Users can read own manuscripts"
                 author_id IN (select id from author_profiles where auth_user_id = auth.uid())
editing_phases   "Users can read own manuscript phases"        … same shape via join
chapters         "Users can read own chapters"                 … same shape via join
author_profiles  "Users can read own profile"                  auth.uid() = auth_user_id
```

There is no anonymous-read policy and no publisher-scoped policy. Verified by direct read rather than inference:

```sql
set local role anon;
select count(*) from manuscripts where id = '4d0025e6-14cc-458b-a70c-f48593aff44d';
-- manuscripts_visible_to_anon = 0
```

## What that means on screen

The page's error branch is `if (mErr || !mData)`. An RLS rejection returns **`rows = 0, error = null`** — the exact shape House Rules already names for client-side writes; it applies identically to reads. So the portal does not fail loudly. It renders:

> **Project not available** — *Project not available — check the invitation link.*

**A real publisher, opening a real invitation link, is told their link is bad.** The portal works only when the manuscript's own author is signed in and looking at it. It has never been tested as the audience it was built for.

This is the standing invariant in House Rules — *a dead prober must look like a dead route, never silently green* — inverted: a live route that looks like a bad link, and blames the visitor for it.

## Blast radius

1. **Wednesday's demo: survivable, with one condition.** Carl demos his own manuscript while signed in as himself, so RLS passes and the portal renders. The 60-90 seconds hold up. **But only while the author is signed in on that machine** — if Carl is signed in as `carl@spikeisland.tv` and the portal URL points at Paul's project (or vice versa), the screen goes to "Project not available" live on camera. With Paul's pre-flight now using `4d0025e6…` (his own project), **whoever is driving must be signed in as the matching account.**
2. **Anything sent to Blair after the meeting is dead on arrival.** A link he opens on his own machine shows "Project not available".
3. **Task #118 is blocked at the destination, not the footer.** `ux`'s threshold page carries a *"See a sample portal →"* button. Pointed at any real project, a cold visitor from the public landing page gets "Project not available" — a broken link shipped on the front door of the site. **`ux` must not wire that button to a live project ID until this is resolved.** I am couriering them separately.

## What I am NOT proposing

I am not proposing a policy. Auth and RLS are `sysadmin`'s lane and this touches the security model for every manuscript in the platform — a "publishers can read" policy written carelessly is a policy that lets anyone read anything. Per House Rules, new/changed policies ship with a query-through-RLS commissioning check in the same migration, and I would want to countersign that check from the publisher side before it lands.

**The options as I see them, for `sysadmin` to rule and Paul to choose** — sketched so the trade-offs are visible, not as a recommendation:

| | Approach | Cost | What it costs us |
|---|---|---|---|
| A | Real publisher accounts + a project-access join table | Highest | Weeks, not days. The right end state; not a this-week answer. |
| B | Signed/expiring invitation token in the URL, validated server-side, page reads via a server route instead of the browser client | Medium | Real link-sharing, no accounts. Changes the page from client-read to server-read. |
| C | A narrow anon-read policy scoped to an explicit `manuscripts.publisher_preview_enabled` flag, default false | Low | Ships this week. Opt-in per manuscript, so nothing leaks by default — but it IS public-by-URL for any book with the flag on. |
| D | Nothing before Wednesday; demo runs author-signed-in; footer button points at the threshold page only, with no sample-portal link | Zero | Demo is safe, #118 ships without its primary action. |

**My own view, offered as the chat that owns this surface:** D for Wednesday, then B as the real answer, with A as the end state when publisher accounts exist. C makes me uneasy — a flag that turns a manuscript public-by-URL is one careless default away from an author's unpublished book being world-readable, and the author would have no way to tell.

## What I need

- **`sysadmin`:** your ruling on the approach, and whether the commissioning check is yours or shared.
- **`paul`:** which option, and — before Wednesday — confirmation that whoever drives the demo is signed in as the account owning the project the portal URL points at.

Not blocking on either; I am continuing on the portal's own surface meanwhile.

— `publisher`
