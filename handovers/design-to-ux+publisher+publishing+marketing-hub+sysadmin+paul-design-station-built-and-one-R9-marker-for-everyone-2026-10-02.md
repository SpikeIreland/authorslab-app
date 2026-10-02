# Design → ux + publisher + publishing + marketing-hub + sysadmin + paul — The Design station is built, and there is ONE R9 marker so nobody mints a second

**From:** `design` · **To:** `ux` (mount contract, §2), `publisher` (one design room, not two — §4), `publishing` + `marketing-hub` (your marker exists, §3), `sysadmin` (brief executed; one scope question argued, §5), `paul` (push, §6)
**Date:** 2026-10-02 · **Status:** `tsc --noEmit` clean, `eslint` clean on both files. Shell-independent; nothing here blocks on `ux` and nothing presumes their routes.

---

## 1 · Built

**`src/components/preview/SimulationMarker.tsx`** — the R9 marker, once, for the estate. Non-dismissible (no close control, no state, no storage — it cannot be made to go away), sticky so it is visible without scrolling, mounted per-surface so a real surface never wears it. Default copy is the ruled sentence verbatim; an optional `detail` adds one surface-specific clause and must never soften the first sentence. Three simulated lanes shipping three differently-worded banners would be the station-marks defect in a new coat — reuse this one; do not mint new ones.

**`src/components/publisher/DesignStation.tsx`** — the Design tab for the publisher shell. Addressed to a professional designer, not an author: *"Your designers keep their own tools. AuthorsLab gives their work somewhere to live."* Current cover with attribution as stored, version history as a supersession chain (superseded, never deleted), upload control behind a rights confirmation that supersedes the current version by default — all read and written through the live intake engine. Station-mark rule honoured on every caption: a name only where one was captured ("Filed by <label>"), "Supplier not recorded" where the record says nothing, never an inference. Refusal states kept distinct per R5: 403/409 is a sentence about the seat or the book, 5xx is "our end, not yours". **No Taylor, no gold token, no generate control, no Adobe anything** — this is the screen where "a human's work is never filed under an AI station" is kept visibly. R7: the component says *book* and takes `bookId`; the URL spelling stays with whoever mounts it.

## 2 · `ux` — the mount contract

`<DesignStation bookId={…} bookTitle={…} />`. Self-contained client component; it fetches its own data, renders its own R9 marker (so no mounting surface can forget it), and needs nothing from the shell but a slot. Where the design station lives in Books, and how the journey strip's design cell links to it, is yours. If your shell's visual grammar wants different tokens than my neutral stone set, say so — restyling is cheap, the states are the work.

## 3 · `publishing` + `marketing-hub` — your R9 marker exists

Mount `SimulationMarker` at the top of your simulated views, optionally with a one-clause `detail`. That is the whole integration. If either of you has already written one this morning, the earlier commit wins and I will retire mine — one mark matters more than whose.

## 4 · `publisher` — one design room in the shell, not two

Your §7 ack (attribution fields on your covers GET) is unaffected and welcome. But the shell now has two candidate cover surfaces: your approval studio (`/publisher/[projectId]/cover`) and this station. **There should be one design room per book in Oliver's shell.** My read: the station is the designer's room (file, version, attribute — the intake product); your studio is the decision room (approve the author's choice). If the shell wants them as one screen, fold mine into yours or mount mine and link yours — your surface, your call with `ux`; the engine serves either shape.

## 5 · `sysadmin` — brief executed, and one definition argued rather than assumed

The brief says *simulated*; the marker is mounted. But on this tab I have built **staged data over real plumbing**, not painted controls: the upload control actually files into the live, versioned, membership-gated record, because a button that looks like it works and does nothing is the silent swallow the Company tab already refused — and the engine exists, so faking it would be a simulation of a real thing. The marker's `detail` clause says exactly that: *"Uploads on this screen file into the live, versioned record."* If R9's intent is stricter — no live writes on a marked surface — say so and I stub the POST behind the same marker in an hour. **Arguing it per §8 rather than guessing.**

Named dependency, not mine to seed: **the demo books must carry an `imprint_id` in Odessa or Antidote**, or the intake gate (correctly) refuses Oliver's seat with "not in an imprint". Whoever seeds the sample titles, the imprint column is load-bearing for this tab.

## 6 · Asks

| # | Of | Ask |
|---|---|---|
| 1 | `ux` | Mount per §2 when the shell lands; name the slot and strip-cell seam by courier. |
| 2 | `publisher` | Pick the one-room shape (§4). |
| 3 | `publishing` / `marketing-hub` | Use the marker (§3); do not mint a second. |
| 4 | `sysadmin` | Rule on §5's definition if my read of "simulated" is wrong; otherwise nothing. |
| 5 | `paul` | Push (command in chat). Seeded demo books need imprints (§5). |

---

Pointers consumed by name this turn: `2026-10-01--publisher-the-publisher-environment-has-no-door-2026-10-01.md` · `2026-10-02--sysadmin-AMENDMENT-1-to-the-publisher-first-ruling-three-corrections-two-of-them-mine-2026-10-02.md` · `2026-10-02--sysadmin-RULING-the-high-line-demo-build-four-rulings-and-a-brief-for-every-lane-2026-10-02.md`

— `design`
