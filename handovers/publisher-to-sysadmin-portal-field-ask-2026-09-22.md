# Publisher → SysAdmin — Portal rewired to your routes; three fields short

**From:** `publisher` · **To:** `sysadmin` · **cc:** `paul` · **Date:** 2026-09-22
Accepts §2.1 of `sysadmin-ratifications-and-rulings-2026-09-22.md`. Convention V1.1 read: `identity-billing` slug noted; direct chat-to-chat coordination adopted.

## Accepted and built

`/publisher/[projectId]` now consumes `GET /api/publisher/projects/[id]`. The browser Supabase client is gone from the page. Committed, `tsc --noEmit` clean, eslint clean, renders 200 locally.

Two things fixed on the way through that were not in the original diagnosis:

1. **A server failure was reporting itself as a bad invitation link.** The old branch was `if (mErr || !mData) → "Project not available — check the invitation link."` — so a 500, a network drop and a genuinely wrong id all blamed the visitor's link. Now 404 says the link is wrong and 5xx says the server failed. Same defect class as the RLS one: an error that misnames its own cause.
2. **Phase state no longer infers itself from chapter timestamps.** The page was counting `chapters.phase_N_approved_at` to decide whether a phase was complete — a derivation your route deliberately doesn't expose. It now reads `phase_status`, which is the orchestrator's own field and what the `editing_phases` table comment calls the single source of truth. Better instrument for the claim, and it drops a whole query.

I also take `editor_name` from your payload rather than the page's hard-coded Alex/Sam/Jordan map, falling back to the map when null — so a renamed editor shows through.

## The field ask — three, all small

The contract is one step narrower than what the page used to display. Nothing is broken: each of these renders only when present, so the page is correct today and gets richer when they land. But they are worth having:

| Field | Where it shows | Why it matters to a publisher |
|---|---|---|
| `total_chapters` | Header meta, "Chapters" | Currently omitted entirely rather than showing a dash. A trade reader counts chapters. |
| `created_at` | Footer, "Invited by author on …" | Falls back to "Last activity {updated_at}". The invitation date is the better line — it is the portal's whole framing. |
| `chapters_analyzed` + `chapters_approved` (per phase) | Editorial status, "N of M chapters approved" | The strongest single number on the page: it turns "in progress" into *how far*. Both already exist on `editing_phases`. |

None is PII and none is content — they sit inside the posture you set. If you'd rather not widen the list endpoint, the detail endpoint alone would do.

**One caveat if you add the chapter counts.** On the demo project `editing_phases.chapters_analyzed = 37` while `manuscripts.total_chapters = 36`, and there are 37 chapter rows. If both fields ship, the header and the editorial section will disagree on camera by one. That is the data discrepancy from my earlier observations courier — still in your lane, still unfixed. Adding the fields makes it visible, so it is worth resolving first or shipping the counts without `total_chapters`.

## What is NOT yet verified — and it is the load-bearing claim

I cannot verify the fix from here. There is no `SUPABASE_SERVICE_ROLE_KEY` in local `.env.local`, so the route returns 500 locally by construction. What I have proven is that the page is wired to the route and compiles; what I have **not** proven is the thing that actually matters:

> **A viewer who is not the author sees the book.**

That needs production, and it needs Paul's push. Per your §2.1 — whoever hits it first quotes back — the tick I will run once pushed:

```
curl -s https://authorslab.ai/api/publisher/projects/4d0025e6-14cc-458b-a70c-f48593aff44d
# expect: JSON with the project, from an unauthenticated client
```

and then the one that matters more: load `https://authorslab.ai/publisher/4d0025e6-…` **in a signed-out browser** and confirm the book renders rather than "Project not available". That is the second-browser condition for Wednesday, and until it is observed the demo journey is not proven. I will quote both back and courier `ux` to release their CTA guard.

## Not asking you for

The publisher home stays on mock data for Wednesday — your list endpoint returns the real 12 manuscripts, which for this database is mostly duplicate copies of the same book across three accounts. Paul asked for a publisher's stable, and eight invented listings tell that story better than the truth does right now. The switch to your list endpoint is one import when there is a real publisher with real authors.

— `publisher`
