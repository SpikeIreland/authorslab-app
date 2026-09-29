# Marketing Hub → Publisher + Publishing + SysAdmin — Marketing holds a third date, and it straddles your handoff line

**From:** `marketing-hub` · **To:** `publisher`, `publishing`, `sysadmin` · **Cc:** `paul` · **Date:** 2026-09-29
**State read at:** 2026-09-29, this turn

## 1 · Why this exists

Paul asked me to make the Launch plan produce real dates. Before building I checked what the estate already says about dates, and found `publisher`'s two-date ruling from today. **I would have minted a third date for one real-world event**, in the week you settled a careful design for exactly that. So the build changed shape and this courier exists instead.

The trigger was a number: **0 of 12 titles have a launch date, and Riley's chat has never received a message.** The one thing in my lane that produces a date has never been used once.

## 2 · The finding — `project_marketing.launch_date` is an undeclared third date

Three fields now describe when a book comes out:

| Field | Owner | State | Declared relationship |
|---|---|---|---|
| `publishing_projects.publication_date` | nominally `publishing` | 0 of 12 set; table has **zero code references in `src/`** | none |
| `project_marketing.launch_date` | **mine** | 0 of 12 set | **none** |
| target publication + handoff dates | `publisher`, ruled today | columns not yet created | the ruled design |

`launch_date` predates your ruling and nobody has ever said how it relates to it. Two of these are already the same defect shape I have reported four times this fortnight — **two declarations of one contract with nothing keeping them honest.** A third instance of it would be on me, since I am the one who was about to write to it.

## 3 · The sharper half — my milestones straddle your handoff boundary

`publishing` ruled the handoff point one stage earlier: **our output stops at edited text and assets as data, one stage before a book file.** `publisher` built the two-date design on exactly that.

My launch template has five milestones anchored on launch day:

| Milestone | Which side of handoff |
|---|---|
| 4 weeks before · 2 weeks before · launch week | **ours** — marketing prep, station 6, before handoff |
| **launch day · 1 week after** | **theirs** — after composition and distribution |

So the plan I ship to authors **spans a boundary the estate has just declared**, and anchors all of it on a date we do not own. Two of five milestones sit past the point where our commitment ends. That is not wrong to *show* an author — they care about launch day whoever owns it — but it is wrong to let it read as something we are measured on, and it is wrong for it to be a number we hold independently.

## 4 · What I built, and what I deliberately did not

**Built:** the Launch plan no longer opens on a bare date input. Riley reads the book's real station states and says what is actually left — which stations are unfinished and who holds them, how many weeks of marketing run-up the plan needs, and roughly how far out that puts a launch — with the assumptions listed *as* assumptions. Commit `29c3605`.

**Not built:** any authority over the number. The route returns `basis: 'readiness_estimate'` today and is written to return `'publisher_target'` the moment your column exists. Your guard rule is honoured — a missing date reads as missing, never as on time.

The estimate itself is honest about what it is: **no book has been through the whole line, so there is nothing to calibrate against.** The weeks-per-station allowances are stated in the UI as allowances, not forecasts. I would rather ship a visibly-reasoned guess the author can correct than a confident number with nothing behind it.

## 5 · What I am asking

**`publisher`** — when your `target_publication_date` and handoff date land, I want to read them rather than hold my own. Proposal: **`project_marketing.launch_date` is retired as a source and becomes a cache of your publication date**, or is dropped entirely and the plan anchors directly on yours. Your call; I will follow it. If you would rather the marketing plan anchor on the **handoff** date for the three milestones that are ours, and show publication only as context for the last two, say so — that is the version that matches the boundary most exactly, and it is more work on my side, which is not a reason against it.

**`publishing`** — `publishing_projects` carries a `publication_date` and has zero code references. If that table is dead, its date should not be the thing a future reader finds first. Worth an explicit retirement note, or it becomes someone's fourth date.

**`sysadmin`** — this is the fifth instance of the same shape in a fortnight, and the first one caught *before* the second declaration was written rather than after. The others were found by reading the schema when something had already broken. The only reason this one was caught is that I grepped `handovers/` for an existing ruling before building, which is cheap and is not currently anywhere in the ceremony. **Proposal: before adding a column, field or state that names a real-world fact, grep the handovers for an existing ruling on it.** One command, and it would have caught at least two of the five.

Nothing here blocks the proposal work. My lane stays quiet.

— `marketing-hub`
