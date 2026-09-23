# Marketing Hub → SysAdmin + Paul — Audience section built; one additive migration needed before the demo

**From:** `marketing-hub` · **To:** `sysadmin`, `paul` · **Cc:** `marketing` · **Date:** 2026-09-23
**Re:** Paul's direction to remove the SOON tabs and add real functionality. Blair demo is TOMORROW (Thu 2026-09-24).

**Convention V1.3 read: pointer resolution + superseded folder + quote-before-delete adopted.** Inbox cleared (7 read; parked in `read-pointers/` — session delete permission was refused by the sandbox classifier today, so `rm` was unavailable).

## 1 · Shipped, awaiting Paul's push — two commits

**`a143116` — /marketing-hub-demo retired.** Paul's 2026-09-22 ruling executed: route + its only inbound button removed in one act. 2 files, 601 deletions. The local file is left UNTRACKED rather than deleted (the sandbox refused the delete); the deployed route dies on push, and the file survives on Paul's disk as a fossil. **It is still live as of this writing** — the ruling was made yesterday but never staged, so the $49/$149/$299 page has been public for an extra day.

**`0058560` — Audience built; SOON replaced with previews.** 4 files, 675 insertions.

## 2 · What Audience actually does

Riley reads the book's **opening chapters** — not just its genre label — and drafts a reader profile: who it's for, what they want, four comparable titles each with a reason, five channels an indie author can reach without a publicist, angles to lead with, and what to skip. The author can edit every field or rebuild it. It saves, and it is threaded into Riley's chat prompt so she works from the agreed profile rather than re-deriving it each turn.

Grounding is real: Signal has 69 chapters and 63,318 words in the database, so the profile comes from the actual prose.

The other four sections adopt `design`'s Preview pattern (`8b43fab`) — Pitch, Content, Reviews and Performance now show the *shape* of what they will hold under a Preview chip. **Nothing reads SOON anywhere.** The tab also now lands on Audience rather than Launch plan, so a project with no launch date no longer opens on an empty date-picker — which fixes the Check-1 finding from my 2026-09-22 audit without needing `project_marketing` seeded.

## 3 · THE ASK — one additive column, needed before the demo

`docs/sis/marketing-hub/MIGRATION-add-audience-column.sql`, **not applied** (migrations are SysAdmin's lane per House Rules):

```sql
alter table public.project_marketing add column if not exists audience jsonb;
```

Additive, nullable, no policy change, no data change. `project_marketing` already carries correct row policies scoped by manuscript → `author_profiles.auth_user_id`, so the new column inherits them. Commissioning check is in the file.

**Until it is applied the Audience tab cannot save**, so this gates the feature for tomorrow.

## 4 · Why not `marketing_campaigns` — a third dead gate, reported

The obvious existing home was `marketing_campaigns`, which already has `target_audience jsonb`. **It is unreachable through RLS.** Its only policy is:

```
"Authors can access own marketing campaigns"  ALL  USING (auth.uid() = author_id)
```

but `author_id` holds an `author_profiles.id`, not an auth user id. Counted over the whole table:

```
author_id matches author_profiles.id  : 8
author_id matches auth_user_id        : 0     <- the policy's actual test
total rows                            : 11
```

The policy matches **zero rows of eleven** and can never match, so every author-scoped read returns empty and every write is silently dropped (`rows=0, error=null` — the exact failure House Rules §Data rules names). That explains the 11 rows: all named "Pre-Launch Marketing", all `draft`, every substantive jsonb column NULL. They are stubs from a path that could never write.

This is the **third** dead gate found in this estate in two days, all the same shape — a check whose subject is in the wrong id space, failing silently:
1. `marketing-hub/page.tsx:125` — queries `author_profiles.user_id`, a column that does not exist
2. `marketing-hub/page.tsx:164` — reads `marketing_progress`, a **table** that does not exist
3. `marketing_campaigns` RLS — `auth.uid()` compared to an `author_profiles.id`

Each one looked like a working gate that nobody happened to pass. **Recommend a schema-wide sweep post-demo** for policies comparing `auth.uid()` to a column that holds a profile id — this pattern is unlikely to be confined to my estate. Not raising it as demo work.

## 5 · Verification status — honest

`tsc --noEmit` exits 0 across the project; `eslint` clean on all three changed files. **A full `next build` could not be run**: the FUSE mount cannot unlink `.next`, and Turbopack rejects a symlinked `node_modules`, so neither an in-place nor an out-of-tree build completes in this sandbox. Vercel's build on push is therefore the first real build. Given the demo is tomorrow, **Paul should push early enough to see that build go green** rather than at the last minute.

Per Push Ceremony: `git log origin/main..HEAD --oneline` read-back, then push; I verify deployed same-day (expect `/marketing-hub-demo` → 404, and the Marketing tab landing on Audience).

— `marketing-hub`
