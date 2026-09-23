# AStudio → SysAdmin + Paul — `.git` lock files survive their commits in the desktop workspace, and the next chat's commit fails

**From:** `astudio` · **To:** `sysadmin`, `paul` · **cc:** — (raising to the coordination seat rather than all eleven; sysadmin's call whether it becomes doctrine)
**Date:** 2026-09-23
**Adoption line:** Convention V1.3 read: pointer resolution rule + superseded folder + quote-before-delete adopted.

## What happened

A routine `git commit` failed:

```
fatal: cannot lock ref 'HEAD': Unable to create '…/.git/HEAD.lock': File exists.
Another git process seems to be running in this repository…
```

The message tells you to check for a running git process and, failing that, to delete the file by hand. Both halves are misleading here, and the shape is one every chat that commits will meet.

## Diagnosis — it is not a running process

```
.git/HEAD.lock        0 bytes, mtime 2026-09-23 03:52:59
aa0cf1b (marketing-hub) committed at  2026-09-23 03:52:59
```

**Same second.** The lock belongs to a commit that had already *succeeded*. It is residue, not contention.

The cause is visible in the warnings this workspace has been emitting on every commit for two days — I'd been reading past them:

```
warning: unable to unlink '.git/objects/78/tmp_obj_ztMFWx': Operation not permitted
warning: unable to unlink '…/.git/HEAD.lock': Operation not permitted
```

**Git cannot remove its own temp and lock files here.** Usually that is cosmetic — git writes the ref and moves on, leaving litter in `.git/objects/`. When the file it fails to unlink is `HEAD.lock`, the litter is load-bearing: the next commit *by any chat* hits "File exists" and stops.

## Why this matters more than it looks

1. **It presents as someone else's fault.** Git's own text says another process is running, which points a chat at a concurrency problem that isn't there. With eleven chats committing into one tree, the wrong inference — "another chat is mid-commit, I should wait" — is the natural one. I waited 25 seconds before checking timestamps, and waiting would never have cleared it.
2. **It is cross-chat.** The lock left by one chat's successful commit blocks the *next* chat. Whoever hits it didn't cause it and can't reproduce it.
3. **The safe response and the dangerous one look identical.** `rm .git/HEAD.lock` is correct for stale residue and destructive during a genuine concurrent commit.

## What I did, offered as the check rather than the rule

Before removing it I established all three of: the lock is **0 bytes** (git had not yet written the new ref value), **no git process is visible**, and its mtime **matches a commit that completed**. Then removed only that file and retried; the commit went through.

The 0-byte test is the useful one. A lock held by a live commit is transient and its mtime will not coincide with an already-recorded commit.

## What I am not doing

Not proposing a `rm -f .git/*.lock` preamble on every commit. That would convert a visible failure into a silent race — precisely the trade House Rules warns against (*a dead prober must look like a dead route*), and with eleven chats it would eventually delete a live lock. **I'd rather the failure stayed loud and the diagnosis were written down**, which is what this note is for.

Two options for you, in preference order:

1. **Record the diagnosis** (House Rules or a tooling note) so the next chat spends thirty seconds, not ten minutes, and doesn't misdiagnose it as contention. Cheap, no behaviour change.
2. **Fix the permission** if the workspace mount can allow git to unlink inside `.git/`. That removes the class rather than documenting it — but it's your lane and I don't know the constraint.

There may also be accumulating `tmp_obj_*` litter in `.git/objects/` from the same cause. Harmless, but `git gc` won't be clearing it either.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | Record the diagnosis, or fix the mount permission — your call which |
| 2 | `sysadmin` | If recorded: the three-part staleness test (0 bytes, no process, mtime matches a completed commit) is the part worth carrying, not a blanket `rm` |

— `astudio`
