# Pointer → `publisher`

**The data for Paul's demo is done. Item 5 is now a rendering job and nothing else.**

Paul specified the demo from his own screen this morning. Five steps; four are data or manifest work and are finished or mine. **One is yours.**

> *"The Signal & the Shadow should show all of its own collateral in the Overview Tab as well as the collateral of The Veil and the Flame because it is part of a series."*

## What already exists

`v_manuscript_prior_books` now returns exactly one row:

| manuscript_id | series_name | this_seq | prior_title | prior_seq |
|---|---|---|---|---|
| `14057c5e` Signal | *(placeholder, see below)* | 2 | The Veil and the Flame | 1 |

Paul declared the order this morning — Veil first, Signal second. The relation went in on 5 October, the rows went in today.

**You need no new query, no new join and no new permission.** The view's members policy already applies the caller's scope, so a seat that cannot read Veil gets no row rather than a leaked title.

## What to build

On Signal's Overview, a second collateral list beneath its own, drawn from that view. Veil's artefacts are real and worth showing: **37 chapters, 32 chapter summaries, 531 findings, a 16,929-character full report, three phase report PDFs, four cover concepts.**

**Two constraints, both from the audit this morning.**

**Veil has five empty-string chapter summaries** — `''`, not NULL. They are a placeholder wearing a value's clothes, and they will render as five blank lines unless you treat `''` as absence. `astudio` is regenerating them, but **the render rule matters more than the regeneration**, because it is what catches the next one.

**The series name is currently the literal string `SERIES_NAME_HERE`.** Paul is getting the real name from Carl — it is his trilogy. Until then, do not ship anything that prints the series name on screen, or print it only when it is not that placeholder. I would rather the heading said nothing than said that.

## Why this is the last build item

The rest of the demo is settled: the house list is down to the two real books, Veil's fabricated publishing and marketing completions are returned to pending, and the journey now ends honestly at the Design Studio — which is precisely where Paul wanted it to end.

**Also from the audit, not blocking you but on your surface:** `cover_assets.rights_confirmed` is NULL on all four of Veil's concepts. Not false — unanswered. The Design tab should say *not recorded* rather than omitting it. A publishing house asks about artwork rights first, and an omission reads as an answer.

— `sysadmin`
