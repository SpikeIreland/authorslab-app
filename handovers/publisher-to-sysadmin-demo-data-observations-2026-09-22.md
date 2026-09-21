# Publisher → SysAdmin — Three data observations from the demo-project check

**From:** `publisher` · **To:** `sysadmin` · **cc:** `paul` · **Date:** 2026-09-22 · **Status:** one item is demo-visible Wednesday; two are post-demo. None block me.

Ran the pre-demo data check on the portal's live reads against the confirmed demo project — `c037e098-2f9c-4728-8ac3-f97fb40665fc`, *The Veil and the Flame*, `carl@spikeisland.tv`. The portal reads `manuscripts`, `editing_phases` and `chapters` at page load.

**The good news first:** the failure I predicted does not apply here. I had flagged that the editorial-status section falls back to counting `chapters.phase_N_approved_at` when `editing_phases.chapters_analyzed` is 0, and would render *"0 of — chapters approved"*. On this project all five phases read `chapters_analyzed = 37, chapters_approved = 37, phase_status = complete`. The section renders clean. Flag withdrawn for this project; it stands for any thinner one.

## 1. `total_chapters` disagrees with the chapter rows — DEMO-VISIBLE

```
manuscripts.total_chapters          = 36
select count(*) from chapters where manuscript_id = 'c037e098…'  = 37
```

The portal's header card prints "Chapters **36**" from the manuscript row. The editorial-status section two blocks below prints "**37** of 37 chapters approved" from the phase rows. If Paul rules for the re-order I proposed, those two numbers land in the same viewport on camera.

Neither number is wrong in itself — they come from different places and one of them is stale. **This is a one-row data fix in your lane, not a portal bug**, so I am not touching it. Worth deciding which is true before Wednesday; a publisher reading a book's own page is exactly the reader who counts chapters.

## 2. Three identical manuscripts titled *The Veil and the Flame* — POST-DEMO, but a demo hazard

| Project ID | Author account | Phase |
|---|---|---|
| `c037e098-2f9c-4728-8ac3-f97fb40665fc` | `carl@spikeisland.tv` | 5 |
| `7509f8bb-4207-4bad-9b08-c0203081b6e0` | `carlglyons@yahoo.com` | 4 |
| `4d0025e6-14cc-458b-a70c-f48593aff44d` | `paul.lyons@authorslab.ai` | 5 |

Same title, same 47,291 words, same genre, different owners and different phase state. Carl holds two of them under different emails.

The demo hazard is simple: **if Carl signs in to the wrong account on Wednesday he gets the phase-4 copy**, and the portal link Carl clicks through to is keyed to the phase-5 project ID — so the author side and the publisher side would be showing two different books with the same name. Worth Carl confirming which account he is signed into before he starts, not during.

Longer term this is a duplicate-project question for you. I have no view on which should survive; flagging it, not proposing a cleanup.

## 3. The portal renders phases 1-3 only, but this book is complete through 5 — POST-DEMO, mine to fix

The editorial-status section hard-codes `[1, 2, 3]` and names Alex / Sam / Jordan. This project also has **phase 4 (Taylor, design) and phase 5 (Quinn, marketing) complete at 37/37**. So the publisher view currently understates how far the book has actually travelled.

For a 60-second demo that is fine and arguably simpler. For the real product it is wrong — the publisher-side view should show the whole journey, and design/marketing completion is precisely what a trade publisher wants to see. **This one is mine**; I am recording it on my post-demo list, not asking you for anything.

Related, and useful to me later: `cover_assets`, `cover_drafts` and `cover_versions` are all **0 rows**, and `manuscripts.selected_cover_version_id` exists but is unpopulated. So the schema for a real cover-approval loop is already there and simply has nothing in it. That is the hook I will build the publisher-side cover approval onto when I wire it with `design` — I will courier you before I touch anything that reads or writes those tables.

— `publisher`
