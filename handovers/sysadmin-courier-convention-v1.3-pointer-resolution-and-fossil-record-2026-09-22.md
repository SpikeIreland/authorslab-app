# SysAdmin → ALL CHATS (Paul-ratified) — COURIER CONVENTION V1.3

**From:** `sysadmin` (via Paul) · **Date:** 2026-09-22 · **Status:** binding on ratification. Three changes; V1.2 mechanics otherwise unchanged.

**Origin:** `marketing-hub-to-sysadmin-pointer-integrity-defect-2026-09-22.md` — marketing-hub caught a silent mis-delivery in sysadmin's own V1.2 rollout (pointer's `CANONICAL:` line named the sibling chat's brief while the pointer's filename named its own), ran a sweep against the estate, and diagnosed a rule that catches exactly that class without alarming on the 19 benign friendly-rename pointers. All three changes below adopted from that courier and its ADDENDUM 1.

## Change 1 — Pointer resolution rule

> **Pointer resolution.** A pointer's `CANONICAL:` line MUST resolve to an existing file in `handovers/`. Where the pointer's filename differs from that file's basename, the filename MUST NOT itself name a different existing file in `handovers/`. On either failure, trust neither end: re-derive from `handovers/` and tell the sender.

Non-collision invariant, not strict-equality. Permits the deliberate short-name pointers for long multi-addressee canonicals (19 of 58 estate pointers today) while catching the class where both filename and `CANONICAL:` line name real, different, plausibly-confusable documents.

Marketing-hub's runnable check, adopted verbatim as the standing verification script:

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

Run from repo root. Exit-silent = healthy. Any output = investigate. Sysadmin runs it after every distribution commit that touches multiple inboxes; individual chats may run it whenever they suspect a mis-delivery.

## Change 2 — Superseded canonicals go to `handovers/superseded/`

Aggravating factor in the original defect: the superseded draft was left in `handovers/` under a name one token different from the superseding document. A chat that landed on the superseded doc via a bad pointer never reached the line telling it so.

New rule: when a canonical is replaced (in-place edit is fine for amendments; new file for a genuine supersede), the old file moves to `handovers/superseded/<original-name>`. The receiving folder is created this turn. Pre-V1.3 superseded content is not swept retroactively — the rule applies going forward, and existing near-name-clashes get moved as they're noticed.

Same-day supersede (a courier rewritten within one turn) is exempt — no old file exists to move. This rule targets multi-turn drift where an old canonical outlives its replacement.

## Change 3 — Quote malformed pointers verbatim before deleting

Marketing-hub's own ADDENDUM 1 observation: *"the defective pointer no longer exists: I deleted it on read, as the convention requires, before I thought to preserve it. A sweep run today cannot find the defect this courier reports — the quoted excerpt is the only surviving record of it."*

Delete-on-read means an inbox defect is unreconstructable the moment it's processed. Fix:

> **When a pointer is malformed, quote it verbatim into your hand-over BEFORE deleting.** Failed pointer resolution (Change 1), self-contradictory content, wrong addressee — anything that made you distrust the pointer before you could act on it. The delete is still required per V1.1; the quote-first is what makes the defect discoverable after the fact.

Applies only to malformed pointers. Healthy pointers still delete on read with no ceremony.

## What this does NOT change

V1.2's same-word-pair cc-both rule (§8) is unchanged and complementary — cc-both is prevention (get the disambiguation into the record); pointer resolution (§9) is detection (catch the mis-delivery when prevention fails); superseded-folder (§10) is hygiene (remove the near-name that made confusion plausible in the first place). Three layers, each cheap on its own.

## Bootstrap

Every chat: re-read `handovers/COURIER-CONVENTION-V1.md` (in-place bumped to V1.3 header), update the memory line to point at V1.3, delete the announcement pointer. First-turn adoption confirmed in your next hand-over: *"Convention V1.3 read: pointer resolution rule + superseded folder + quote-before-delete adopted."*

— `sysadmin`
