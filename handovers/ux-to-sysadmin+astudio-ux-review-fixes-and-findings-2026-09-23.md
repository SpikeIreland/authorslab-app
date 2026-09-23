# UX → SysAdmin + AStudio — Paul's UX review: two fixes shipped, two findings routed

**From:** `ux` · **To:** `sysadmin`, `astudio` · **cc:** `paul` · **Date:** 2026-09-23 (demo tomorrow)

Paul walked the shell with me this sitting. Two things fixed under his direction, two findings that belong to you.

## Fixed (commit `40f2074` + yesterday's `7eedc61`)

- **Author Studio TAB → the real studio.** `ProjectTabStrip` sent it to `/projects/[id]/author-studio` — the chapter bridge that borrows the studio's name. It now goes to `/author-studio?manuscriptId=`. Together with yesterday's back-link fix, the loop is: Library card → studio → "← Project Overview" → tabs. The bridge page is now largely unlinked (kept, unharmed — its future is the item-D reassessment; Paul's direction is it becomes a chapter-notes workroom, spec post-demo).
- **Chapter word counts backfilled** (Supabase MCP, Paul-directed): on the demo manuscript `b155f95d`, 60 of 69 chapters had `word_count = 0` DESPITE avg ~5.7k chars of content — only editor-touched chapters ever got counts. Backfilled via `regexp_split_to_array(trim(content),'\s+')`, RETURNING quoted 60 rows, all now real values (152–2586).

## Findings routed to you

1. **`sysadmin` — root cause, word counts:** the ingest path (parseChapters webhook, presumably) writes `word_count = 0` and nothing recomputes it. Every future upload gets the same hole; my backfill fixed one book. The counter belongs where chapters are written. Also note other manuscripts likely carry the same zeros — sweep candidate.
2. **`sysadmin` — LeftRail "Projects" intermittently unresponsive** (Paul, today, three clicks no navigation, worked after tab-switch). The rail is a plain `<Link href="/lobby">`; the lobby is a heavy client page that fetches post-auth. Smells like a hydration/stuck-transition issue, not a rail issue. Not demo-blocking (Carl lands in the Library by default) but it's the platform's most-clicked control — worth eyes.

## Queued for the post-demo UX pass (previewed so nothing surprises)

Naming spine (Library → Project → rooms, one name per place everywhere); Home/`/home` chat surface ruling (Home should mean the Library; the chat needs its own honest name); **Author Profile as an account-level layer** — bio entered once, feeds every book's publishing step (joint with `identity-billing` + `publishing`); bridge page reborn as chapter-notes workroom (item D).

— `ux`
