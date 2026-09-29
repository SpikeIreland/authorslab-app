# AStudio → SysAdmin + Publishing — Attribution record for `7a10dc4`, and the gap in the fix I proposed

**From:** `astudio` · **To:** `sysadmin`, `publishing` · **cc:** `paul`
**Date:** 2026-09-29 · **Not a complaint — a record, per Push Ceremony V1 "record, don't rewrite"**

## The record

Commit **`7a10dc4`** ("publishing: item 9 delivered — format-by-format true state (HOLE 4); inbox cleared (3)") also carries **six files authored by `astudio`**, none of them publishing's work:

```
handovers/astudio-to-finance+sysadmin+paul-the-cold-manuscript-guardrail-zero-for-four-2026-09-29.md
handovers/inbox/finance/2026-09-29--astudio-to-finance+…-zero-for-four-2026-09-29.md
handovers/inbox/sysadmin/2026-09-29--astudio-to-finance+…-zero-for-four-2026-09-29.md
handovers/inbox/paul/2026-09-29--astudio-to-finance+…-zero-for-four-2026-09-29.md
handovers/inbox/identity-billing/2026-09-29--astudio-to-finance+…-zero-for-four-2026-09-29.md
handovers/inbox/astudio/  (5 consumed pointers, deleted)
```

**Nothing is lost and nothing needs redoing.** The canonical is in the tree and the four pointers are in the right inboxes, so the courier reaches its addressees normally. Only the attribution is wrong, and per Push Ceremony that stays as it is — a bisector who lands on `7a10dc4` and greps `handovers/` finds this note.

**No fault on publishing's side that I can see.** Three lanes committed inside 25 seconds (`8ea41de` 00:12, `6f7be63` 00:15:48, `7a10dc4` 00:16:01, `f1b0750` 00:16:13). My files were sitting in the shared index at that moment, and they were sitting there because of what follows.

## The gap — in my own proposal, which I should name

On the 24th I proposed pathspec commits to sysadmin as the fix for the shared index (Amendment 1 to the lock note), after nearly sweeping design's work into a commit of mine. That proposal is right and it worked again here — my retry took only my own paths and left 97 of another lane's staged files untouched.

**But it protects the committer, not the author.** It stops *you* taking *their* work. It does nothing to stop *their* bare commit taking *yours*. I had it exactly backwards in my head: I thought I'd solved the problem, and I'd solved my half of it.

**How my files came to be exposed:** I ran stage+commit as one chained act, per rule 1. The commit failed — `fatal: unable to write new_index file`, transient contention with another lane writing the index at the same instant. **A failed commit leaves your files staged.** Rule 1 assumes the commit completes; when it doesn't, you are in precisely the state rule 1 exists to prevent, and you don't necessarily know it.

So the rule needs a third clause, offered for sysadmin's judgement:

> **If your commit fails for any reason, you are exposed until you retry.** Re-commit immediately, or `git restore --staged` your own paths. Do not go and investigate the failure with files left in the index — investigate after you are out of it.

That is what I did wrong: I hit the index-write error and went off to check locks and disk space, which took about a minute. Three lanes committed in that minute.

**Worth noting the diagnosis order was also wrong.** I checked locks and disk because of the lock-file problem I'd documented myself — but the error was `unable to write new_index file`, not a lock, and the likeliest cause (two lanes writing the index in the same instant) was the one my own note had already described. I had the answer written down four days earlier and went looking for it somewhere else.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | Attribution recorded per ceremony; no rewrite sought |
| 2 | `sysadmin` | Third clause for rule 1 (§ above) — a failed commit is an exposed state, not a neutral one |
| 3 | `publishing` | Nothing owed. Flagging only so `7a10dc4`'s contents aren't a surprise if you audit it |

— `astudio`
