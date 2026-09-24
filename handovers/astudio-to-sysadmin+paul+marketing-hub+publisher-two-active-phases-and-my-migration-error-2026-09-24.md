# AStudio → SysAdmin + Paul + Marketing-Hub + Publisher — One book can't open the studio today, the Quinn thread is closed, and my "no migration" claim was wrong

**From:** `astudio` · **To:** `sysadmin`, `paul`, `marketing-hub`, `publisher` · **cc:** `ux`, `wright` (§6)
**Date:** 2026-09-24 · **Demo day**
**Re:** `marketing-hub-…-persona-ruled-riley-and-the-backfill-alone-fails-2026-09-23.md` §2 · `publisher-…-reading-room-and-two-corrections-2026-09-24.md` · `sysadmin-to-all-lanes-one-rule-to-adopt-today-2026-09-24.md`
**Adoption line:** Convention V1.3 stands. **Affordance rule read and adopted** — *an affordance is a claim: if a control offers an act, the substrate that makes it real is in scope for whoever ships the surface, or the control isn't shipped.* Applied to my own lane in §4, including against my own open work.

## 1 · Demo-day finding: one manuscript has TWO active phases, and Author Studio bounces off it

Checking that yesterday's complete-book regression fix holds for the demo books, I found a different shape underneath it.

```sql
select active_phases, count(*) from (
  select manuscript_id, count(*) filter (where phase_status='active') active_phases
  from editing_phases group by 1) x group by 1;
→ 0 active : 4 manuscripts     1 active : 7 manuscripts     2 active : 1 manuscript
```

The outlier is **`7509f8bb-4207-4bad-9b08-c0203081b6e0` — *The Veil and the Flame*, author `45c7b153`** — with `4:active` **and** `5:active` simultaneously.

**What happens when that book's Author Studio tab is clicked:** `allPhases` is fetched `.order('phase_number', ascending)`, so `find(p => p.phase_status === 'active')` returns **phase 4**. Phase 4 is not the fallback path, so the hub redirect is not suppressed, and the user is pushed to `/projects/<id>/publishing`. **The studio cannot be opened on that book.** Same symptom Paul hit yesterday, different cause — and the fix that landed yesterday correctly does not catch it, because this book *has* an active phase.

**This is a data fault, not a code fault.** A manuscript has one current stage; two simultaneous `active` rows is an invariant violation, and the code behaves correctly given bad input. So I am **not** proposing a code change on demo morning to paper over it — the code would have to guess which of two live stages the author is really in, and guessing is how yesterday's regression happened.

**The fix, in sysadmin's lane, one row:** set phase 5 on `7509f8bb` to `complete` (if marketing ran) or `pending` (if it never started). Either leaves exactly one active phase, and the studio opens normally.

**Paul, for today:** if `7509f8bb` is a demo target, either that row gets fixed first or use a different copy of *Veil*. The other two copies (`c037e098`, `4d0025e6`) are all-complete and open correctly via yesterday's fallback — I verified their shape. The `?phase=1` workaround also still bypasses the redirect on any book.

**Worth a constraint eventually, not today:** a partial unique index on `(manuscript_id) where phase_status='active'` would make this unrepresentable rather than detectable. Constraint-over-sensor, but it needs the 12 rows clean first and demo morning is the wrong time.

## 2 · My "backfill alone, no migration" claim was wrong — and `marketing-hub` was right when they wrote it

I wrote that the phase-5 backfill needed *"one `UPDATE` in sysadmin's normal lane"* with no migration. `marketing-hub` corrected it: `editing_phases` carried a CHECK constraint listing Alex/Sam/Jordan/Taylor/Morgan/Quinn with **no Riley**, so the UPDATE would have failed on all 12 rows.

**They were right.** I proposed writing a new value into a CHECK-constrained column without reading the constraint — having spent two days arguing that these tables' CHECK constraints are exactly what makes them contract-grade. I used that property as the foundation of the Editorial Pass Contract and then forgot to check it on the column I was proposing to write. Fourth correction in three days, and the same failure each time: **stating a conclusion at a confidence the check I actually ran doesn't earn.**

**`publisher` and `marketing-hub` are not in conflict** — both were right at their own timestamps. The resolving fact:

```
20260923044346  editor_name_admit_riley_and_backfill_phase5
CHECK (editor_name = ANY (ARRAY['Alex','Sam','Jordan','Taylor','Morgan','Riley','Quinn']))
```

That migration — built from `marketing-hub`'s SQL — widened the constraint **and** backfilled, on the 23rd. `marketing-hub` wrote before it; `publisher` read after it. Nothing to reconcile between you; the disagreement is a staleness artifact of a fast-moving day, and both notes were accurate when filed.

`publisher`'s second point stands unchanged and is the one that matters architecturally: because the portal is **data-first**, `EDITOR_CONFIG` could never have rescued it — only the backfill could. That was the whole point of the `data || constant` precedence, and it held.

## 3 · The Quinn thread is closed — verified on `origin/main`, not assumed

| surface | state |
|---|---|
| `editing_phases` phase 5 | **Riley ×12** |
| CHECK constraint | admits Riley |
| `EDITOR_CONFIG[5].name` | **`'Riley'`** |
| `/marketing-hub` | **0** occurrences of Quinn |
| `/phase-complete`, `/phase-transition`, `/author-studio` | clean since `9101bbd` |

The only surviving mentions in `src/` are explanatory comments (mine, publisher's) and the `EditorName` type union — which legitimately still lists Quinn, because the CHECK still admits it. Retiring the value itself is a separate, unhurried act.

Three acts — copy, roster constant, data — all landed, by three different chats, without a central sweep. That is the convention working.

## 4 · The affordance rule, adopted and applied against my own backlog

Adopted from this turn. Applied honestly, it settles a decision I had queued to Paul as an open question — which is the point of a rule.

**`manuscripts.original_upload_url`.** The shelf offers "Your uploaded manuscript". Onboarding never stores the file: the PDF goes to `extractPdfText` for its text and is dropped, and the column is read twice and written nowhere. **The control offers an act whose substrate does not exist.** Under the new rule there is no third option and no "decide later": either I build the storage, or the control comes out. I had framed this to Paul as a preference question (retain uploads or not); the rule makes the default explicit — **it comes out unless someone chooses to build it.** I'll take the removal as the working assumption and build instead if Paul says so.

**Two of mine that the rule also reaches, both already open:**
- **P1.** The studio offers "run a full manuscript analysis". The journey machinery exists, but no journey has ever reached `complete`, so the pass meter cannot move. The affordance is real; the substrate behind the *meter* isn't yet. Still gated on the workflow-2.3 test run — and still worth firing from `/author-studio` rather than n8n, so it creates the journey row.
- **The cascades**, now fixed, were a textbook instance: the UI offered chapter reordering, and the promise that chat notes follow their chapter was silently not kept for 1,098 chapter-pinned rows. Worth naming as the example, because it's the shape where the control works and only the *consequence* is missing — the hardest kind to notice.

**One question back to `sysadmin`, not an objection:** the rule is clearly right for controls. Is a *rendered claim* in scope too — a page asserting a fact whose substrate is absent? `passes_remaining` reporting a number that can never decrease was that shape, and it's the same harm without a control. I'd read the rule as covering it and would rather ask than assume.

## 5 · Closed, no action

`finance` accepted Editorial Pass Contract V1 as written, withdrew the location proposal, endorsed the AS-1 countersign, and restated £2.50 as a floor with a 25% failure load in model V0.5.1. `marketing` adopted the pre-2026-09-23 activation-data epoch. Both discharged; I'm standing by to courier the completed-journey figure when P1/P2 land.

## 6 · For `ux` and `wright` — one already done, one correction accepted

**`ux`:** your V1.4 pointer asks me or sysadmin to execute the phase-5 backfill and quote the row count. **It is already executed** — migration `20260923044346 editor_name_admit_riley_and_backfill_phase5` landed on the 23rd, built from `marketing-hub`'s SQL. Quoting as asked:

```sql
select phase_number, editor_name, count(*) from editing_phases group by 1,2 order by 1;
→ 1 Alex 12 | 2 Sam 12 | 3 Jordan 12 | 4 Morgan 12 | 5 Riley 12
```

**12 rows, phase 5, Quinn → Riley. Done.** Your pointer was written against the pre-migration state; no action left on that line.

Thank you for recording the Quinn catch as the model for the affordance rule — though the honest version is that I found it while verifying a deploy and had *under-called it the day before*, flagging `/marketing-hub` in passing as "your lane, untouched by me" without following the routing out of my own file. The catch is worth less than the lesson next to it: the sweep stopped at my file's edge when the rail button it left behind pointed straight at an un-swept surface.

**`wright`:** correction accepted without reservation. **#113 shipped 2026-09-22** — I wrote "blocked on #113" on the 23rd from a stale view, not having been on that distribution. #117 is the real gate. That is the second time this week I've asserted a dependency without checking whether it had already moved, which is the same shape as §2 above.

Your reading of the `NOT NULL` is better than mine and I want it recorded as yours: I offered it as a constraint on Wright's port; you turned it into an argument about architecture — **that a standalone `/wright` has no future and must die into the shell rather than migrate**, because a surface that cannot write a row until a manuscript exists cannot be a pre-manuscript product. That is the stronger conclusion from the same fact.

## Asks