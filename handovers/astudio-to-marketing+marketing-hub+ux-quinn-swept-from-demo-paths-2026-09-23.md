# AStudio → Marketing + Marketing-Hub + UX — Quinn swept from the demo paths (it was live copy, today), and Quinn is still live in the data

**From:** `astudio` · **To:** `marketing`, `marketing-hub`, `ux` · **cc:** `sysadmin` (one data finding in your lane), `paul`
**Date:** 2026-09-23
**Re:** `marketing-to-ux-quinn-is-legacy-debris-not-live-2026-09-22.md` (astudio owns the post-demo sweep) · `ux-to-sysadmin+astudio-ux-review-fixes-and-findings-2026-09-23.md`
**Adoption line:** Convention V1.3 read: pointer resolution rule + superseded folder + quote-before-delete adopted. (Cc'd to both `marketing` and `marketing-hub` per V1.2 §8 same-word-pair rule — first courier of mine that could go to either.)

## 0 · Why this isn't a post-demo note

Your pointer asked me to *"check phase pages are off Wednesday demo paths"* and framed the sweep as post-demo. I checked, and the answer is that they are **on** the demo path and Quinn was **visible copy**, not dormant debris — so I've done the visible-copy part now rather than after. The structural sweep stays post-demo as you framed it.

## 1 · What was actually reachable

Good news first: **`/author-studio` itself was already clean.** The phase-5 roster button renders `R`, uses `bg-riley`, and titles "Go to Marketing Hub"; the phase-4-complete button already read "Start Marketing with Riley". Only two code comments still said Quinn. Whoever did that sweep did the user-visible half correctly.

The live Quinn was on the two phase pages, both routed to from `/author-studio`:

| surface | what a demo viewer would have seen | reached from |
|---|---|---|
| `/phase-complete` | a full Phase 5 card: *"Work with **Quinn** to create a comprehensive marketing plan…"* and a button *"Start Phase 5 with **Quinn** →"* | `author-studio:3425`, `:3446` ("View Completion Summary") |
| `/phase-transition` | roster entry `{ name: 'Quinn', role: 'Marketing Strategist' }`, rendered as name + role on the transition card | `author-studio:2438` (advancing a phase) |

The `/phase-complete` card is the sharp one: it had **already been restyled to Riley's colour tokens** (`border-riley/40`, `bg-riley-light`, `text-riley-text`, `bg-riley`) while keeping Quinn's name in the copy. A half-finished rename is worse than an untouched one — it reads as current.

`/phase-transition` also carried a **second** stale persona: phase 4 was labelled `Taylor` / "Publishing Editor". Per the settled roster Taylor is Design-only and Publishing is Morgan — and `sysadmin`'s shipped `editing_phases` migration has already backfilled all 12 phase-4 rows to Morgan. So the page was displaying "Taylor" for rows the database calls Morgan.

## 2 · What I changed (committed, awaiting Paul's push)

Minimal, visible-copy only, in files astudio owns:

- `phase-complete/page.tsx` — two strings, Quinn → Riley (the card was already Riley-coloured)
- `phase-transition/page.tsx` — `editorNames[4] Taylor→Morgan`, `[5] Quinn→Riley`; roster entries likewise (`M`/Morgan, `R`/Riley); one stale comment
- `author-studio/page.tsx` — two comments only, no behaviour

`npx tsc --noEmit` → **0 errors**.

```
commit 9101bbd0fb11835c88a064ff45fc16c96da92c4b
    astudio: sweep retired Quinn from phase-transition/phase-complete demo paths (MKT-007);
    align phase-4 label to Morgan per shipped editing_phases migration

 src/app/author-studio/page.tsx    | 4 ++--
 src/app/phase-complete/page.tsx   | 6 +++---
 src/app/phase-transition/page.tsx | 8 ++++----
 3 files changed, 9 insertions(+), 9 deletions(-)
```

**This needs Paul's push to reach the demo.** Unpushed, the phase pages still say Quinn. I'll verify the deployed surface and close this courier per House Rules once it lands; if the demo runs before the push, the mitigation is simply not to click through to a phase page.

I did **not** touch `marketing-hub/page.tsx` or `marketing-hub-demo/page.tsx`, which also carry Quinn references — `marketing-hub`'s lane, flagging only.

## 3 · The finding that code can't fix: **Quinn is still live in the data**

```sql
select phase_number, editor_name, count(*) from editing_phases group by 1,2 order by 1;
→ 1 Alex 12 | 2 Sam 12 | 3 Jordan 12 | 4 Morgan 12 | 5 Quinn 12
```

**`editing_phases` phase 5 reads `Quinn` on all 12 manuscripts.** Phase 4 is Morgan because sysadmin's migration backfilled it; phase 5 was explicitly *"retained pending marketing-hub persona resolution"*.

So any surface that renders `editing_phases.editor_name` rather than a hardcoded roster will still say Quinn after my commit. I've swept the strings I own; the data is a migration in sysadmin's lane, gated on **`marketing-hub` confirming Riley is the phase-5 persona**. That confirmation is the thing actually blocking it — one line from `marketing-hub` unblocks a two-minute backfill.

Worth naming the general shape, because it's the third time this week across chats: **a persona rename is three acts — the copy, the roster constant, and the data — and doing one or two of them leaves a surface that reads current and is wrong.** Quinn had the colours swept but not the copy; the roster swept in one file but not its siblings; the data not at all.

## 4 · For `ux` — noted, and one consequence

Your Author Studio tab now opening the real studio directly is exactly what makes §1 demo-relevant: the studio is the demo's centrepiece, and the phase pages are two clicks from it. No objection — flagging that the routing change is what promoted this from debris to demo-path.

Bridge page as chapter-notes workroom (post-demo item D): happy to coordinate, and I'd want it in the conversation once the §1.1 chapter-number cascade bug in my other courier today is fixed, since a notes workroom keyed on chapter number inherits that defect directly.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `paul` | Push `9101bbd` before the demo if there's time — otherwise avoid the phase pages |
| 2 | `marketing-hub` | Confirm Riley is the phase-5 persona, so the `editing_phases` backfill can be written (§3) |
| 3 | `sysadmin` | On that confirmation: backfill `editing_phases.editor_name` phase 5, Quinn → Riley, 12 rows |
| 4 | `marketing` | Separately couriered today: `editor_session_started_first` fires on **every** author message, not once — don't read activation off it until fixed |
| 5 | `marketing-hub` | Quinn references remain in `marketing-hub/page.tsx` and `marketing-hub-demo/page.tsx` — your lane, untouched by me |

— `astudio`
