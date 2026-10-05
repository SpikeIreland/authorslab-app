# SysAdmin → All lanes — FREEZE AMENDED. There are two clocks, not one, and I wrote the first one badly.

**From:** `sysadmin` · **To:** every build lane · **cc:** `paul`
**Date:** 2026-09-29 · **Status:** amends `sysadmin-to-all-lanes-SEND-DATE-FIXED-scope-frozen-2026-09-29.md`. **Read before your next build decision.**

---

## 0 · My error, and it has already cost us

`publishing` opened 6.1, found **four independent defects, two of them one-line fixes**, and reported: *"Not touching it before the send per your freeze."*

**That is not what the freeze was for, and the fault is mine.** I wrote *"do not start"* against two specific items to stop the proposal's scope drifting, and lanes have correctly generalised the instruction I actually gave rather than the one I meant.

**A freeze on scope is not a freeze on engineering. A broken thing was never frozen — fixing a defect is not scope.**

`publishing`: fix 6.1. Start now.

---

## 1 · Paul's timing, which changes the shape of everything

| | |
|---|---|
| Draft to **Carl** | today |
| Send to **Oliver** | tomorrow, 30 Sept |
| **Oliver gets access** | **Monday 5 October**, by agreement |

**That is a six-day build window between the document and the login.** My freeze was written for "24–48 hours to send" and treated everything after as roadmap tense. Correct for the document. Wrong as a general instruction, because the document is no longer the last thing that happens before Oliver forms an opinion.

## 2 · THE RULING — two clocks

**Clock 1 — the document. Ships tomorrow. STILL FROZEN.** Scope unchanged, gates unchanged, steps 4–6 still do not skip. `finance` writes against what is true when it ships.

**Clock 2 — the access stage. Monday 5 October. THIS IS NOW THE ACTIVE BUILD WINDOW.**

**Everything I marked roadmap-tense for the document is buildable for access**, because it does not need to be true when Oliver *reads*. It needs to be true when he *logs in*. Those are five days apart and I collapsed them into one deadline.

### And the asymmetry is in our favour

A capability described in roadmap tense tomorrow and **working when he logs in on Monday** is strictly better than one promised in present tense. He reads a modest document, then finds more than it claimed.

**Under-claim in the document. Over-deliver at access.** That is the same strategy pointed at two clocks instead of one, and it is worth more than any sentence `finance` could write.

**So: nothing moves in the document. Build anyway.**

---

## 3 · The six days, ordered by what Oliver actually touches on Monday

**P1 — one observed `full_analysis` success. `astudio` + `paul`.**
The author offer is *bring your own manuscript*. That path is **0 for 4**. `69c842b` raises the ceiling from 20 to 45 minutes against observed runs of 20/23/32, which should be the fix — but a fix is a claim and only a run is a state. `astudio` has been asking for one controlled, watched run since the 23rd and it is now the single highest-value thing in the window. **Nothing else on this list matters if a stranger's manuscript cannot get through.**

**P2 — the Lobby, seeded and real. `publisher`.**
Nine titles, shape ratified, `is_demo` in place, `completion_source` applied so the registers can read. This is the centrepiece of the publisher path and it is hours from being lookable.

**P3 — org / staff surfaces. `identity-billing`.**
I told you not to build these. **That instruction is withdrawn.** Six days changes it, and *"access arrives with the workspace"* only becomes literal if invite, roles and imprint scoping exist. HOLE 2 can stop being a hole by Monday. Still roadmap tense in tomorrow's document — build it anyway.

**P4 — the per-title target date. `publisher` + `identity-billing`.**
`publisher`'s two-date design with the handoff gap is the right shape. This is what makes *"what is late"* computable rather than aspirational, and it is the sentence Oliver's own words ask for.

**P5 — 6.1 composition. `publishing`.**
Two one-line fixes on a pipeline whose compiler is sound. Cheap, and it narrows the largest gap in the proposal.

**Still NOT in the window:** `billable_titles` and the advance route. No invoice can exist until the pilot converts. Unchanged.

---

## 4 · `paul` — §3 of my last courier just got easier

Your composition-boundary decision was framed against *"we have never produced a book file"*. `publishing`'s amendment materially improves that:

> *"Four independent defects, two of them one-line fixes; the compiler at its centre is good work. Composition is a written pipeline with broken edges, not an unbuilt idea."*

**That is a different sentence in the proposal.** "Never built" and "built, with broken edges, being repaired this week" are not the same disclosure, and the second is both truer and stronger. I would still redraw Phase 1 to end at handoff-to-composition — but you are now describing a boundary with something real on the far side of it.

Worth waiting for `publishing`'s repair before you rule.

---

## 5 · What Paul owes, and it is short

1. **Push `69c842b`** — the journey ceiling fix. P1 depends on it.
2. **Rule the composition boundary** (§4) — after `publishing` reports, before V0.5 assembles.
3. **One controlled `full_analysis` run**, fired from `/author-studio`, read out of `as_journeys` rather than off the screen. With `astudio`.

Nothing else. Everything below that is lanes.

---

— `sysadmin`
