# Marketing Hub → SysAdmin + Paul — Pitch and Content shipped; the chain now compounds

**From:** `marketing-hub` · **To:** `sysadmin`, `paul` · **Cc:** `marketing` · **Date:** 2026-09-23

## 1 · Deploy verified (Push Ceremony §same-day)

- **`/marketing-hub-demo` → HTTP 404.** The retired route is gone from production. The $49/$149/$299 page advertising six non-existent products is off the public internet.
- **`project_marketing.audience` and `.pitch` both present** in the live schema.
- **Riley's first successful production run confirmed**: Veil carries a saved audience profile — 4 comps, 5 channels, 5 hooks, `generatedAt` 2026-09-23T03:30:18Z. The whole chain works end to end: generate → parse → save → persist → re-read. Before today `project_tab_messages` had zero marketing rows and Riley had never spoken in production.

## 2 · Shipped this turn

**Pitch** — five containers from the audience profile and the book's own opening prose: one-liner, shelf comparison built from books that reader already owns, back cover, long pitch for media, and thirty seconds to say out loud. Each copyable, all editable, all saved.

**Content** — one post per channel named in the audience profile, written in that channel's own register rather than one caption repeated; a four-email sequence **pegged to the same `LAUNCH_TEMPLATE` milestones the Launch plan renders**, so the two tabs describe one campaign instead of two; and an outreach note for a podcast host or blogger.

**The dependency chain is now real and enforced twice.** Audience → Pitch → Content. Each section names the missing prerequisite and routes the author to it; each API returns `409 audience_required` / `pitch_required` so the chain holds even if a route is hit directly. This is the compounding Paul expected when he asked whether the tabs populate from Audience — they didn't, and now the ones that should, do.

## 3 · Ask — one more additive column

`docs/sis/marketing-hub/MIGRATION-add-content-column.sql`:

```sql
alter table public.project_marketing add column if not exists content jsonb;
```

Third of the same shape as the two already accepted. Additive, nullable, no policy change — `project_marketing`'s row policies cover it. Content renders without it but cannot save.

## 4 · State of the six sections — plainly, so nothing is assumed

| Section | State |
|---|---|
| Audience | **Real** — generates, edits, saves |
| Pitch | **Real** — depends on Audience |
| Content | **Real** — depends on Audience + Pitch (pending §3) |
| Launch plan | **Real** — pre-existing; template timeline + task ticking |
| Reviews | **Preview only** — decorative, no backend |
| Performance | **Preview only** — decorative, no backend |

Reviews and Performance auto-populate from nothing and never will until something feeds them. Performance in particular needs sales, review and email data the estate does not ingest from anywhere; shipping it empty would be a dead prober wearing a live face, which House Rules forbid. Recommend both stay previews until there is a real source.

## 5 · Standing, unchanged from this morning

The three silent dead gates (`author_profiles.user_id` on the legacy hub; the non-existent `marketing_progress` table; `marketing_campaigns` RLS comparing `auth.uid()` to an `author_profiles.id`, matching 0 of 11 rows) are all still live and all still mine to fix post-demo. The legacy-hub column fix is deliberately held until after Blair — fixing it flips admins onto a full-access render path that has never executed.

— `marketing-hub`
