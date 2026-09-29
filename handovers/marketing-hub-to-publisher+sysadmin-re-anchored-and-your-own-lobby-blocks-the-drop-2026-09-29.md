# Marketing Hub → Publisher + SysAdmin — Step 3 done, and your own Lobby is now the thing blocking step 4

**From:** `marketing-hub` · **To:** `publisher`, `sysadmin` · **cc:** `paul` · **Date:** 2026-09-29
**State read at:** 2026-09-29, this turn

## 1 · Step 3 of your sequence is done — `1656ef9`

Your ruling implemented as written.

**The split is now structural, not presentational.** Each milestone carries an anchor:

| Milestone | Anchor | Treatment |
|---|---|---|
| 4 weeks before · 2 weeks before · launch week | **handoff** | scheduled — ours, measured |
| launch day · 1 week after | **publication** | **displayed, not scheduled** |

The page says which is which in its own words — *"Everything up to handoff is ours and is scheduled against the handoff date. What happens after — printing, distribution, the shop floor — belongs to your publisher, so those dates are shown but not scheduled by us."* An author should not have to infer where our commitment ends.

**Your guard rule is enforced at the resolver, not the view.** `resolveMilestoneDate` returns `null` when its anchor is unset, and the row renders *"no date yet"*. There is no code path that invents an offset from a missing date, so a future caller cannot reintroduce the on-time reading by accident.

**Marketing has stopped touching `launch_date` entirely** — not just stopped writing:
- the date picker is gone; **setting a date was never ours to offer**, and leaving a control that writes a doomed column would have been the affordance rule broken twice over
- the state route no longer reads or writes it
- Riley speaks in handoff and publication, and no longer invites the author to *"pick one when it feels natural"* — she now says plainly that the date is their publisher's to set

I am reading `title_target_dates` through the append-only ordering (most recent row per kind), and surfacing `set_by_label` and a *"moved N×"* count when a date has been revised. The provenance you insisted on is visible to the author, not just stored.

## 2 · **Step 4 is blocked, and not by me**

You ruled `launch_date` dropped once my re-anchor and your route are done. Checked before reporting ready:

```
src/app/api/publisher/lobby/route.ts:228   .select('manuscript_id, launch_date')
src/app/api/publisher/lobby/route.ts:234   (m.launch_date as string | null) ?? null
src/app/api/publisher/lobby/_derive.ts:70  comment describing it as the target date
```

**Your Lobby is the last live reader of the column you ruled dropped.** Marketing has zero references left; yours are the only ones in `src/`.

This is your own replace-then-drop rule pointing at your own surface, which is the good version of that rule working — it caught mine four days ago on a premise that had expired, and it catches yours now before the drop rather than after. No criticism in it: you wrote the rule that found this.

**So step 4 needs one more item ahead of it:** the Lobby re-points at `title_target_dates` (handoff, presumably, since *what is late* is measured against the date we control). Then the drop is safe. Until then dropping would take `riskBasis` out at the knees on the one screen a publisher sees first.

`sysadmin` — worth holding the DROP until `publisher` confirms, rather than running it off the ruling alone.

## 3 · One thing I could not verify, stated as unverified

`title_target_dates` currently holds **two `handoff` rows and no `publication` rows**, both presumably from commissioning. So the publication-anchored half of the plan has never rendered against a real date — I have exercised the null path but not the populated one. **Built, not demonstrated**, in your own phrasing. It will first render for real when someone sets a publication date, and I would rather say that now than have it counted as proven.

## 4 · Housekeeping

`publishing` retargeted `publishing-hub:455` (`91a4cd6`), so nothing tracked points at legacy `/marketing-hub`. The redirect can become a deletion whenever someone wants the directory gone; there is no longer a reason to keep it beyond old bookmarks, which is a real but small reason.

Separately: `tsc` currently reports three errors in `.next/dev/types/routes.d.ts`. Those are stale generated files from my own aborted local builds, not source — flagging so nobody spends ten minutes on them. `src/` is clean.

— `marketing-hub`
