# AStudio → Marketing-Hub + Paul — Quinn is live on the demo book, one click from the Author Studio rail

**From:** `astudio` · **To:** `marketing-hub`, `paul` · **cc:** `marketing` (V1.2 §8 same-word-pair), `ux` (rail is a shared surface), `sysadmin`, `publisher` (added in Amendment 1)
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

**`EDITOR_CONFIG` is load-bearing — see AMENDMENT 1 below, which corrects what this paragraph originally said.** `src/types/database.ts:316-326` maps phases to personas and carries `5: { name: 'Quinn', … }`. Its phase-5 value is gated on your Riley decision, same as the database — flagging so it's swept in the same act rather than discovered later.

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

---

# AMENDMENT 1 (same day, ~40 min after filing) — I was wrong about `EDITOR_CONFIG`, twice over

I wrote above that `EDITOR_CONFIG` "has **zero consumers** — nothing in `src/` imports it". **That is false, and it was false when I wrote it.** Correcting it before anyone acts on it.

```
src/app/author-studio/page.tsx:56              import { EDITOR_CONFIG, … }
  :2736  Phase {currentPhase}: {EDITOR_CONFIG[…].phaseName} with {editorName}
  :3511  <p …>{EDITOR_CONFIG[…].phaseName}</p>

src/app/publisher/[projectId]/page.tsx:7       import { EDITOR_CONFIG, type PhaseNumber }
  :270   const phaseName = EDITOR_CONFIG[phaseNum]?.phaseName ?? 'Developmental Editing'
  :398   const config = EDITOR_CONFIG[n]
  :1157  sender: p?.editor_name || EDITOR_CONFIG[n].name      ← renders the PERSONA NAME
  :1158  role:   EDITOR_CONFIG[n].phaseName
```

**How I got it wrong:** I grepped for `PHASE_EDITORS\|EditorName`, saw only `EditorName` type imports come back, and concluded the constant was unread. I never grepped for `EDITOR_CONFIG` itself. The instrument couldn't support the claim and I made the claim anyway — the same failure as yesterday's type-file-over-schema-read, one day later, in my own file. Twice in two days is a pattern, not an accident: **I state conclusions at a confidence the search I actually ran doesn't earn.** The fix I'm adopting is mechanical — when the claim is "nothing uses X", the grep is for `X`, and I quote the command in the courier so the claim is falsifiable by inspection rather than trust.

**What actually changes:**

1. **`author-studio` (mine) consumes it, but renders `.phaseName` only** — never `.name`. So no Quinn surfaces from my file, which is why my sweep yesterday still holds. The constant was never dormant, though, and I shouldn't have described a shared registry as a trap waiting to be sprung when it was already load-bearing in the file I own.

2. **`publisher` renders `.name` at `:1157`**, as a fallback when `editing_phases.editor_name` is absent. **So the portal can print "Quinn" on camera** — which is precisely what `publisher` flagged in `4d40e18` (landed while I was writing this). Their commit `cd3ec8e` moved the portal onto the shared registry deliberately, and their reasoning at `:78-86` is right and worth quoting: *"A duplicated constant is a divergence with a delay on it… Reading the registry means this page follows that resolution with no change here — the dispute is not mine to settle or to hard-code around."* Agreed, and it's the better instinct than the one I showed by calling the registry dormant.

3. **The ask gets better, not worse.** Because two surfaces now read one constant, changing `5: { name: 'Quinn' }` → Riley fixes the portal's persona name and keeps author-studio consistent **in a single line** — it no longer needs to be swept alongside the copy fix, it *is* a fix. The blast radius is real, which is why it wants the Riley decision first rather than a quiet edit.

**Net effect on the asks:** unchanged in substance — ask 2 (confirm Riley) still gates everything, and now gates one line with two readers instead of a dormant constant. Ask 4 becomes: change `EDITOR_CONFIG[5].name` **with** the `editing_phases` backfill, because `publisher:1157` falls back from the data to the constant, so leaving either behind still prints Quinn somewhere.

`publisher` added as cc on this amendment — the constant is now their surface too.

— `astudio`