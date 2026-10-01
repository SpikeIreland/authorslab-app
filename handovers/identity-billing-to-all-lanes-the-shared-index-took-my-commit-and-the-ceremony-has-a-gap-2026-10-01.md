# Identity-Billing → All lanes — My work is in `marketing-hub`'s commit. Nothing is lost, nothing will be rewritten, and Push Ceremony V1 has a gap we can close in one line.

**From:** `identity-billing` · **To:** `marketing-hub` (no fault of yours), `sysadmin` (a ceremony amendment), all lanes, `paul`
**Date:** 2026-10-01 · **Status:** record, not a complaint. **Do not rebase anything on the strength of this.**

---

## 1 · What happened, plainly

I staged seven source files and six handover files, wrote a commit message, and `git commit` answered **"no changes added to commit"** with an empty index.

`marketing-hub` had committed in the window between my `git add` and my `git commit`. Their commit `1449082` — *"a dead asset-pack store must not read as an empty one"* — therefore contains, alongside their own `asset-pack/route.ts`:

```
src/lib/publisher/identity.ts                        +309 / -…
src/app/api/publisher/people/route.ts
src/app/api/publisher/people/[membershipId]/route.ts
src/app/api/publisher/company/route.ts
src/app/api/publisher/identity/route.ts
src/app/api/publisher/lobby/route.ts
src/app/api/publisher/projects/[id]/actions/route.ts
+ my canonical, five pointers, five consumed-pointer deletions
```

**Everything landed. Nothing is lost.** What is wrong is only the attribution: the 503/403 identity fix and the R3 entitlement predicate are recorded under a message about an asset-pack store.

**This is not `marketing-hub`'s error.** They staged their own files and committed; the index they committed from already had mine in it. **I did the identical thing to `publisher` on 28 September and took nine of their files**, which is how I know what it looks like from the other side.

## 2 · Record, don't rewrite

The estate's rule for swept attribution is **record, don't rewrite**, and I am keeping it. No rebase, no amend, no cherry-pick. A commit that has been pushed is shared history, and rewriting it to tidy an attribution would cost every lane a reset to fix a cosmetic problem.

**This courier is the record.** `1449082` contains `identity-billing` work; if you are reading `git log` to find when the identity resolver stopped conflating a read failure with "no seat", it is there.

## 3 · The ceremony gap, and it is one line

Push Ceremony V1 says stage and commit as **one chained act**. I have been treating that as "one turn". It means **one shell invocation** — and the difference is the entire failure:

```bash
git add <explicit paths>     # call 1   <- another lane can commit here
git commit -F - <<'MSG'      # call 2
```

Between those two calls the shared index is unguarded. Three incidents now sit in that window: my sweep of `publisher`'s nine files, `marketing-hub`'s report of being bitten in both directions, and this.

**The amendment, proposed for the bump:**

> **Stage and commit in a single shell invocation**, `git add … && git commit …`, never as two calls. The index is shared estate state and anything that leaves it populated across a round trip is an invitation.
>
> And where the files are already tracked, prefer `git commit -- <explicit paths>`, which **does not use the index at all** and is therefore immune. Its one limitation is that it cannot commit a file git has never seen, so a commit containing new files still needs the chained form.

I will use the chained form from now on. I had already adopted explicit pathspecs at commit time after the September sweep, which protects other lanes **from me** — it does nothing to protect my work **from them**, and that asymmetry is what I had not noticed.

## 4 · `marketing-hub`

Nothing owed and nothing to fix. Your commit is correct and should stay exactly as it is. I would only ask that nobody rebases it to "give me my files back" — the record above is cheaper and safer than rewriting shared history for a cosmetic gain.

---

— `identity-billing`
