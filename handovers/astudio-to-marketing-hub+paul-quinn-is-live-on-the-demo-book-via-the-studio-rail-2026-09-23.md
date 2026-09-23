# AStudio → Marketing-Hub + Paul — Quinn is live on the demo book, one click from the Author Studio rail

**From:** `astudio` · **To:** `marketing-hub`, `paul` · **cc:** `marketing` (V1.2 §8 same-word-pair), `ux` (rail is a shared surface), `sysadmin`
**Date:** 2026-09-23 · **Priority: demo-affecting, today**
**Re:** my own `astudio-to-marketing+marketing-hub+ux-quinn-swept-from-demo-paths-2026-09-23.md` §2 (where I flagged this and did not pursue it)
**Adoption line:** Convention V1.3 read: pointer resolution rule + superseded folder + quote-before-delete adopted.

## The finding

I swept Quinn from my own surfaces yesterday and flagged, in passing, that `marketing-hub/page.tsx` still carried Quinn references — "your lane, untouched by me". I under-called it. Verifying my deploy this morning against the tree at the deployed SHA, the exposure is larger and it is **reachable on the demo book right now**.

**1 · `/marketing-hub` is Quinn-branded throughout.** Sixteen user-visible strings at `e859246`, including the chat panel's own header:

```
:451  <p className="font-semibold …">Quinn</p>
:582  <h3 className="font-bold">Quinn</h3>
:598  "Quinn is Waiting"
:617  "Chat with Quinn"
:643  placeholder "Ask Quinn about marketing…"
:560  "Start with Quinn's Marketing Assessment"
:600  "Complete your publishing setup with Taylor, then Quinn will be ready…"
```

(`:600` also still says Taylor for what is now Morgan's phase.)

**2 · It is one click from the studio rail, on the demo book.** `author-studio/page.tsx:2854` renders the phase-5 rail button enabled whenever phase 5 is not `pending`, routing to `/marketing-hub`. For *The Veil and the Flame*:

```sql
select m.title, ep.phase_number, ep.editor_name, ep.phase_status …
→ The Veil and the Flame | 5 | Quinn | complete
→ The Veil and the Flame | 5 | Quinn | active
→ The Veil and the Flame | 5 | Quinn | complete
```

Phase 5 is unlocked, so **the button is live, not greyed**. The rail button itself is correctly branded `R`/Riley — it just opens a page that says Quinn a dozen times. That's worse than an obviously-locked door: it reads as a working, current part of the product.

The two phase pages I fixed yesterday were the smaller half of this. I should have followed the routing out of my own file rather than stopping at my file's edge — "fixes route by chat roster, never file proximity" is about ownership, and it cuts both ways: I don't own the fix, but I did own noticing where my rail sends people.

## Why I have not fixed it

`marketing-hub/page.tsx` has your in-flight work in it — `b4eeb5b` ("Pitch section built — five containers") is committed and **currently unpushed**. Editing the same file from here is exactly the collision Push Ceremony rule 2 exists to prevent. It's yours; you'll do it in one pass with the work already open.

## What it needs (small, if you want it before the demo)

A find-and-replace on the visible strings, Quinn → Riley, plus `:600`'s Taylor → Morgan. The page's colour tokens are already `orange`/Riley-adjacent, so this is copy only — the same half-finished-rename shape I found on `/phase-complete` yesterday, where the styling had been swept and the name left behind.

**If it can't land before the demo,** the mitigation is the same shape as publisher's cover call: don't click the phase-5 rail button on *The Veil and the Flame*. A working demo beats a tidy one, and this is cosmetic-but-conspicuous rather than broken.

## Two related items, neither urgent

**`EDITOR_CONFIG` is a dormant trap.** `src/types/database.ts:316-326` maps phases to personas and carries `5: { name: 'Quinn', … }`. It has **zero consumers** — nothing in `src/` imports it (only the `EditorName` type is imported, by `author-studio` and `helpers.ts`, and a type renders nothing). So it is not a demo risk. It is the pattern Wright flagged in July: a constant nobody reads, sitting ready for the next person who needs a phase→persona map to find it and silently resurrect Quinn. Its phase-5 value is legitimately gated on your Riley decision, same as the database — flagging so it's swept in the same act rather than discovered later.

**The three-act shape again.** Copy, roster constant, data. `/marketing-hub` has the copy un-swept; `EDITOR_CONFIG` is the roster constant; `editing_phases` phase 5 is the data (12 rows, still Quinn). All three are gated on one decision from you — **is Riley the phase-5 persona?** One line unblocks a copy pass, a constant, and a two-minute backfill together.

## Deploy verification for my own commits (House Rules, same-day)

`9101bbd` (Quinn sweep) is pushed and deployed: production `dpl_2hnfhdAcagqJJ6NP8KNGhHgiXFHv`, state **READY**, `githubCommitSha e8592469b63ca91606427669385d4211bf3e7d9a` — which `git ls-remote origin main` confirms is what GitHub holds, and `git merge-base --is-ancestor 9101bbd e859246` confirms contains my commit.

**Stated honestly: I verified the deployed SHA, not the rendered page.** The device shell has no egress to the host, the container's proxy returns 403 CONNECT for it, and Vercel's own fetch tool reports no access to this project. What I *can* assert is stronger than a bare status — `git grep Quinn e859246 -- src/` returns **zero user-visible hits in `phase-complete` or `phase-transition`** (one explanatory comment of mine), so the tree that built the READY production deployment has my sweep in it. If anyone loads `/phase-complete` today, a one-line confirmation closes it properly.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `marketing-hub` | Quinn → Riley across `/marketing-hub` visible copy (+ `:600` Taylor → Morgan); yours, and your file is already open |
| 2 | `marketing-hub` | Confirm Riley is the phase-5 persona — it gates the copy, `EDITOR_CONFIG`, and the `editing_phases` backfill together |
| 3 | `paul` | Before the demo: either land ask 1, or avoid the phase-5 rail button on *The Veil and the Flame*. Also `b4eeb5b` is unpushed |
| 4 | `sysadmin` | On ask 2 landing: `editing_phases.editor_name` phase 5 Quinn → Riley (12 rows), and sweep `EDITOR_CONFIG` in the same act |

— `astudio`
