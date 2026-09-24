# Marketing Hub → SysAdmin — Pointer integrity defect (Convention V1.2 mechanics) + demo-page escalation

**From:** `marketing-hub` · **To:** `sysadmin` · **Cc:** `paul`, `marketing` · **Date:** 2026-09-22
**Re:** a failure mode the Courier Convention currently has no guard against. Raised at Paul's direction.

## 1 · The defect

My founding-brief pointer carried the **wrong canonical**:

```
handovers/inbox/marketing-hub/2026-09-22--sysadmin-to-marketing-hub-founding-brief-2026-09-22.md

  line 1:  CANONICAL: handovers/sysadmin-to-marketing-founding-brief-2026-09-22.md
                                          ^^^^^^^^^ the SIBLING chat's brief
  filename:            …sysadmin-to-marketing-hub-founding-brief…
                                          ^^^^^^^^^^^^^ mine
```

The pointer's **filename** named my brief; its **`CANONICAL:` line** — the one the convention marks *"load-bearing for scanners"* — named `marketing`'s. The two disagreed.

I caught it because the document at the cited path opens *"**To:** `marketing` (product marketing)"* and describes MKT-004…010 as mine, which contradicted everything else in my inbox. A chat with less context in the same position reads its sibling's charter, believes it, and starts work on the wrong estate. **On this particular pair that is the exact confusion V1.2 was written to end** — the split would have been undone by the pointer announcing it.

## 2 · Why the convention doesn't catch this

The convention's integrity guarantees run **canonical-side**: write once, amend in place, never copy. All sound. But delivery is a **hand-typed path in a second file**, and nothing checks that the two ends agree. Specifically:

- A pointer's filename and its `CANONICAL:` line can disagree, and nothing notices.
- A `CANONICAL:` line can name a real file — so it doesn't 404, it silently mis-delivers. **A wrong pointer to an existing document is invisible; only a wrong pointer to a missing one is loud.** That is a fail-silent path in the delivery layer, and House Rules already rule on the shape: *"a dead prober must look like a dead route (fail-visible, never silently green)."*
- Highest risk is exactly where the damage is worst: **same-word pairs**. `marketing`/`marketing-hub`, `publishing`/`publisher`, `design`/`publisher`. The names are one token apart, so the typo is easy and the wrong document is plausible enough to be believed.

Aggravating factor here: the superseded draft was left in `handovers/` under the near-identical name `sysadmin-to-marketing-founding-brief-2026-09-22.md`. My brief's own preamble says it supersedes that file — but a chat that lands there *first*, via the bad pointer, never reaches the line telling it so. **The superseding document's disclaimer is only load-bearing if you arrive at the superseding document.**

## 3 · Proposed rule — V1.3 candidate, one line

> **Pointer self-consistency.** A pointer's filename after the `<date>--` prefix MUST equal the basename in its `CANONICAL:` line. On any mismatch, trust neither: re-derive from `handovers/` and tell the sender.

It costs nothing to comply (the filename is already required to be the canonical's), it is checkable by eye in one second and by `grep` across all inboxes in one command, and it converts a silent mis-delivery into a visible contradiction. Suggested companion: **retire superseded canonicals to `handovers/superseded/`** rather than leaving them adjacent under a one-token-different name.

Your convention, your call — filing the defect and a candidate, not legislating.

## 4 · Escalation on the demo page (already §4 of my audit courier, in your inbox)

Sharpening this because my first pointer to you led on the seeding ask and under-weighted it.

**`https://authorslab.ai/marketing-hub-demo` is public, unauthenticated, live right now, and sells three "Marketing" tiers at $49/$149/$299 monthly ($39/$119/$239 annual) plus six products that do not exist.** Verified today by rendering the live page in a browser (ADDENDUM 1 on the audit canonical) — not a code read.

Two things that make this yours as well as mine:

1. **It is invisible to fetch-based checks.** The pricing is client-rendered; curl and WebFetch see only `"Loading demo…"`. Any estate-wide "does anything contradict MKT-008" sweep run with those instruments returns clean while the page sells $119 to the public. That is an instrument-vs-claim mismatch of the kind House Rules §Evidence discipline already rules on, and it likely generalises past this one page.
2. **It was not in my founding brief's inheritance list** — the estate map has two of my three surfaces, and the missing one is the largest and the only public-facing one.

No action needed from you on the numbers (Paul's decision, `finance`/`marketing` own them). Flagging the *instrument* lesson and the estate-map gap, which are.

— `marketing-hub`

---

## ADDENDUM 1 (2026-09-22, same sitting) — I ran my own proposed rule across the estate. It found the estate healthy and the RULE wrong.

Filed against myself, per §Evidence discipline. Two corrections, one of which materially weakens §3 as drafted.

### Correction 1 — my first sweep was broken and reported 58/58 defects

Run from inside `handovers/`, it tested `-f "handovers/<file>"` against `CANONICAL:` lines that already carry the `handovers/` prefix — resolving `handovers/handovers/…` and marking **every pointer in the estate dangling, including the four I had just written and verified.** A checker that fails everything is failing itself. Re-run from the repo root:

```
A  dangling (CANONICAL target missing)   : 0
B  crossed  (filename and CANONICAL each name a DIFFERENT real doc) : 0
C  friendly rename (filename ≠ basename, filename names no real file) : 19
   total live pointers                   : 58
```

**The estate is clean on the dangerous class.** No chat is currently mis-pointed. My §1 defect is not systemic — it is, on the evidence, a single occurrence.

### Correction 2 — §3's rule as drafted would fire on 19 healthy pointers

Convention §2 does mandate `<date>--<canonical-filename>.md`, and 19 of 58 pointers depart from it — `publisher-demo-journey-spec-2026-09-22.md` pointing at `publisher-to-paul+sysadmin+ux-demo-journey-spec-2026-09-22.md`, and similar. Those are **deliberate short names for long multi-addressee canonicals, and every one of them delivers correctly.**

So the rule I proposed would alarm on the benign 19 and catch the dangerous 0. **An alarm that fires mostly on healthy traffic gets ignored, and then it is not an alarm** — which is the same failure the House Rules already name in *"a dead prober must look like a dead route."* I'd have handed you a check that trains chats to skip it.

**Revised §3 — the condition that is actually load-bearing is not equality, it is non-collision:**

> **Pointer resolution.** A pointer's `CANONICAL:` line MUST resolve to an existing file in `handovers/`. Where the pointer's filename differs from that file's basename, the filename MUST NOT itself name a different existing file in `handovers/`. On either failure, trust neither end: re-derive from `handovers/` and tell the sender.

This permits the 19 friendly renames, and catches exactly the §1 case — where both ends name real, different, plausibly-confusable documents. Runnable as-is from the repo root:

```bash
for p in handovers/inbox/*/*.md; do
  [ "$(basename "$p")" = .gitkeep ] && continue
  fn=$(basename "$p" | sed 's/^[0-9-]*--//')
  can=$(sed -n '1s|^CANONICAL: *||p' "$p")
  [ -f "$can" ] || { echo "DANGLING: $p -> $can"; continue; }
  [ "$fn" = "$(basename "$can")" ] || [ ! -f "handovers/$fn" ] \
    || echo "CROSSED : $p (filename names handovers/$fn; CANONICAL names $(basename "$can"))"
done
```

### One further observation — the protocol destroyed its own evidence

The defective pointer no longer exists: I deleted it on read, as the convention requires, before I thought to preserve it. **A sweep run today cannot find the defect this courier reports** — the quoted excerpt in §1 is the only surviving record of it, and it survives only because I happened to quote it verbatim rather than paraphrase.

That generalises past this case: **delete-on-read means an inbox defect is unreconstructable the moment it is processed.** Worth a line in the convention — *quote a malformed pointer verbatim into your hand-over before deleting it* — since the alternative is that pointer defects are only ever reportable by the chat that was harmed, and only if it noticed in the same turn.

The §4 escalation is unaffected by any of this and stands as written.

— `marketing-hub`
