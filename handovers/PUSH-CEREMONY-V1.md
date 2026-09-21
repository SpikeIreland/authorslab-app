# AUTHORSLAB PUSH CEREMONY — V1 (2026-09-21)

**From:** `sysadmin` (via Paul) · **Status:** binding on every chat that stages code. Adapted from Clarence's Push Ceremony V3 (which was itself the response to three sweeps in eight days, one commit 97% mislabelled). We adopt the fix pre-emptively.

## The finding, adopted from Clarence as written

One tree, one index, many stagers, one committer — and a `--stat` check performed at staging time cannot protect against damage between staging and commit. **A check whose subject can be mutated after the check is not a check.** The fix closes the window entirely: STAGE+COMMIT ARE ONE ACT, performed by the owning chat, immediately.

## The rules

1. **Stage+commit is ONE act, by the chat that owns the change, in the same breath the work finishes.** The form is one chained command the chat RUNS ITSELF (chats hold commit; Paul holds push — that is the real division):

   ```
   git add 'path/one.ts' 'path/two.ts' && git diff --cached --stat && git commit -m "<subject naming the actual work>"
   ```

   A staged index with no commit attached is a ceremony VIOLATION, not a hand-off. There is no interval to sweep because there is no interval.

2. **Explicit single-quoted paths only.** `git add -A` and `git add .` are FORBIDDEN. A broad add sweeps whatever another chat has in flight into your commit. Today's near-miss (an earlier commit in this project accidentally hoovered up 20+ unrelated docs from `docs/sis/` under a `-A` add — see git log around `df06754`) is the standing example.

3. **The shape check moves to the commit's own output plus a post-commit verify.** The chat quotes `git show --stat <hash>` in its hand-over note; if the shape is wrong the chat says so and the fix happens BEFORE Paul pushes, while it is still local. Fix pattern: `git reset --soft HEAD~1` → re-stage correctly → re-commit.

4. **Paul's hand-off is push-with-read-back — the step lives somewhere explicit:**

   ```
   git log origin/main..HEAD --oneline    # read: exactly the commits you expect to deploy, by subject
   git push origin main
   ```

   *"Everything up-to-date"* on a push you expected to carry commits is a FAILURE signal, not a success message — it means nothing deployed (usually because a commit landed on a different branch or the branch is behind).

5. **Paul-authored changes:** Paul runs the full three-verb chain himself (`add && commit && push`) — no chat handoff involved.

6. **Branch discipline:** work happens on `main` by default. Non-`main` checkouts restore `main` before turn end. Any unexpected-branch state is disclosed in the turn's hand-over. Rejected alternatives, recorded with reasons:
   - Per-chat branches → merge burden lands on the one person who shouldn't hold it (Paul).
   - Staging lock file → unenforced convention is how the window gets opened in the first place.

## Attribution repair — declined, recorded instead

Where a chat's work has been swept into another chat's commit under a pre-V1 `-A` add (the ~20 doc sweep in `df06754` on 2026-09-21 is the current example), the mislabelled commit stays. History rewrites on a pushed shared `main` cost more than they return. The repair is this courier — a future bisector who lands on such a commit and greps `handovers/` finds the true attribution table in the sender's hand-over note. **Under V1, this shouldn't recur.** When it does anyway: record, don't rewrite.

## Same-day deploy verify

Per House Rules: after Paul pushes, the pushing chat verifies deploy in production before closing the courier. For Vercel: hit the affected URL and quote the observed behaviour (or the deploy URL and status). For n8n: quote the active version ID after Paul publishes. For Supabase migrations: quote a schema read of the changed object. A push whose deploy is not verified same-day sits open in the sender's outbox until it is.

## Bootstrap acceptance

Every chat that will stage code accepts this by memory-line the first time it processes its inbox pointer to `PUSH-CEREMONY-V1.md`. First-turn acceptance form (in the chat's next hand-over): *"Push Ceremony V1 read and adopted. No `-A`/`.` stages this session; stage+commit as one act; `git show --stat <hash>` quoted post-commit; deploy verified before close."*

— `sysadmin`
