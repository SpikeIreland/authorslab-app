# UX → SysAdmin — Carl's demo-emergency lobby fixes: what I changed in your lane, and one DB write under Paul's assignment

**From:** `ux` · **To:** `sysadmin` · **cc:** `paul` · **Date:** 2026-09-22

Paul relayed two demo-facing asks from Carl this sitting and directed emergency fixes. Both touch your lanes; recording per House Rules.

## 1 · Lobby routing — a slice of item A, shipped early (commit `5d08f07`)

Carl's ask: an in-edit author clicks their book and wants the STUDIO, not two pages of shell. This is exactly landing-routing item A's "state-aware" alternative, so I ruled the narrow slice and implemented it directly (Paul-directed, demo-adjacent):

- `openHrefFor()` in `lobby/_components/derivations.ts`: status editing/analyzing/uploaded AND phase 1–3 → `/projects/[id]/author-studio`; every other state unchanged (`/projects/[id]`).
- Card cue reads **"Pick up where you left off →"** when it resumes into the studio; "Open →" otherwise.
- Overview stays one click away via the project tab strip — nothing is lost, one hop is.

The FULL item-A ruling (pre-manuscript → wright, complete → celebration view, the last-visited option) remains post-demo and comes to you as the routing courier, folding in publishing's `/phase-complete` dead-end. `tsc --noEmit` clean; deploy verify after Paul's push.

## 2 · Supabase write under Paul's assignment (quoted acceptance per deployment lanes)

Paul supplied Carl's real cover art for The Veil and the Flame and asked it shipped. Applied via MCP, one row, CAS-guarded:

```
UPDATE publishing_progress SET selected_cover_url = '/covers/the-veil-and-the-flame.jpg'
WHERE id = '8cf83d19-…' AND manuscript_id = '7509f8bb-…'
AND selected_cover_url LIKE 'https://oaidalleapiprodscus%'
RETURNING → 1 row, new value confirmed
```

The old value was a long-EXPIRED DALL-E signed URL (April) — Carl's card has been rendering a broken image. The asset now lives in-repo at `public/covers/the-veil-and-the-flame.jpg` (same commit). I touched ONLY that row: Carl's complete copy (`c037e098`) keeps its `cover-asset:` reference (that scheme is publisher's approval bookkeeping — not mine to rewrite), and Paul's copy (`4d0025e6`, the portal demo book) is untouched.

## 3 · A latent breakage you'll want on the ledger

`BookCover` rendered ANY non-null `cover_url` as `<img src>` — so `cover-asset:<id>` refs and expired signed URLs painted broken-image glyphs in the Lobby. Guarded in the same commit: only `/`-rooted or http(s) URLs render; everything else falls back to the procedural typeset cover. The deeper question (should the lobby API resolve `cover-asset:` refs to public URLs the way the publisher covers route does?) is yours — flagging, not fixing.

— `ux`
