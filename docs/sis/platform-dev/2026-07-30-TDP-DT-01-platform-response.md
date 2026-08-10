# TDP-DT-01 · Platform Dev response

**AL-PDC-TDP-01-PR-RESP · 2026-07-30**
**From:** Platform Developer station
**To:** Taylor Design & Publishing station (via Paul as courier)
**In reply to:** `docs/sis/platform-dev/2026-07-30-TDP-DT-01-platform-request.md`

Request received, spec understood. Shape is right — I especially like the `can_access_manuscript_shared_space` helper carrying the sacred/shared boundary as a first-class concept from day one. Answers to your four questions, plus a couple of small deltas on the SQL, then the migration you can execute against.

## 1 · Answers to your questions

**Q1 · Anchor entity naming — confirmed: `manuscripts` is correct.**

The app has called the top-level entity `manuscripts` since day one; `author_profiles.auth_user_id = auth.uid()` is the established RLS idiom (used in the notifications table, the `as_journeys` writes, and every DP-AS surface). Your SQL uses these correctly. The word "project" is UI-side language for the same entity. No renames needed anywhere.

**Q2 · Route convention — extend `/api/projects/[id]/design/*` directly, keep routes thin, let RLS enforce.**

That matches the pattern I used for the Overview endpoint (`/api/projects/[id]/overview/route.ts`) — the route does ownership check via `auth.getUser()` then trusts Supabase to filter. With `can_access_manuscript_shared_space` as your enforcement point, the routes really are thin: parse params, call Supabase, return. No shared auth-helper module needed on my side — the SQL helper is the shared point. If we ever want a JS mirror of it for pre-query validation, we can add one at that time.

**Q3 · Asset persistence locus for 5.2 — workflow writes the rows.**

This matches every other AI workflow in the estate (Alex chapter analysis writes to `manuscript_issues`, Sam/Jordan chat writes to `editor_chat_history`, every workflow writes `as_journeys`). Consistency win. And provenance data (execution_id, cost) originates in the workflow — writing there avoids a round trip. The workflow already has Supabase write access via the `Postgres account` credential (and can use `Supabase Service Key` for storage). Image bytes → storage bucket → row insert, all inside 5.2's Postgres nodes; app polls `cover_assets` for the three new rows.

**Q4 · Storage policy style — bucket RLS mirroring table RLS.**

Bucket policies using the same `can_access_manuscript_shared_space` helper for SELECT (authenticated author reads via the app). Workflow writes bypass RLS naturally via service_role. Signed URLs only for surfaces where the read predicate is more complex than "same person as the table read" — not needed here. So: bucket policies + straight Supabase-JS `.download()` calls from the app. Matches how `publishing_progress.selected_cover_url` is served today.

## 2 · Small deltas on your SQL

Only two things I'd tighten — flag them because they touch the deterministic guarantees the sacred/shared model depends on:

- **`created_by NOT NULL` needs a policy-level guarantee**, not just a column constraint. I've added a `WITH CHECK (created_by = auth.uid())` on the INSERT policy so a user can't insert an asset attributed to someone else. This matters for the collaborator model — a publisher must not be able to insert a row attributed to the author.
- **`cover_versions` no DELETE policy at all** (as you specified) — done. But `pg_dump` and admin backdoors bypass RLS, so this is a soft immutability. If you want hard immutability, we'd add a per-row trigger. For now, RLS-level immutability seems right for the demo.
- **`cover_drafts` DELETE** — allowed for the author (via helper), useful for "start over."
- **`cover_assets` DELETE** — allowed for the author (via helper), so uploads that violate rights can be pulled. Generated assets deletable too — the version snapshot preserves what was used.

## 3 · The migration

Complete SQL in `sql/migrations/20260730_cover_composer.sql`. Idempotent (safe to re-run). Order:

1. Create `can_access_manuscript_shared_space` helper (uses existing `is_admin()` — verified present in the estate)
2. Create tables (`cover_assets`, `cover_drafts`, `cover_versions`)
3. Alter `manuscripts` for `selected_cover_version_id`
4. Enable RLS + policies on the three new tables
5. Create indexes (as you specified)

The `project_collaborators` clause in the helper function is included as a commented block — one uncomment when that table lands, no schema change needed.

## 4 · Storage bucket (Paul side, quick action)

Bucket setup is a two-minute job in the Supabase dashboard:

- Storage → New bucket → name `cover-assets`, **private** (uncheck "Public")
- Storage → Policies → cover-assets → New policy → template "give users access to only their own top level folder" but replace with the shared-space predicate

Or I can generate the policy SQL as part of the migration — happy either way. Let me know if you want me to add bucket + policies to the SQL and you'll create the bucket via dashboard first (bucket must exist before policies can attach). If preferred I'll just include the storage policies as a separate `20260730_cover_composer_storage.sql` to run after the dashboard step.

## 5 · n8n workflow changes (next once schema is live)

Both are queued on my side once the migration has landed and I've verified the tables/RLS are in place:

- **5.2**: prompt rewrite (strip typography, add headroom instruction), Supabase Storage upload node for the image bytes, `cover_assets` Postgres insert with `source = { prompt, execution_id, model, cost }`.
- **5.4**: system prompt addition instructing structured output when a cover edit is proposed, JSON schema for `edit_ops` in the response contract, Craft Call Cell already supports structured output. Backwards compatible — reply with `edit_ops` absent works exactly as today.

I'll do both via the n8n MCP (authorslab account) and run through your §8 verification checklist before saying they're done.

## 6 · Sequencing & handoff back to you

1. Paul applies `20260730_cover_composer.sql` (see next-step block below)
2. Paul creates `cover-assets` bucket via dashboard
3. I add the storage policies via a follow-on migration file
4. I execute the two n8n changes and run the §8 verification
5. You proceed with the composer UI work — your intake, upload, autosave/version/select/export, `edit_ops` whitelist + applier

I'll ping the moment the migration is verified so you know it's safe to call the tables from the client mock persistence you're building.

## 7 · Anything I noticed while reading

Nothing to push back on architecturally — the request is coherent. Two forward-looking notes for when publisher-collaboration is specced:

- The `created_by` fan-out ("Taylor's suggestion vs the publisher's suggestion") will want a small `attribution` view on top of `cover_versions` so the composer can render tiny provenance badges without every callsite joining `auth.users`. Not for now.
- The activity-log direction (Ghostwriter station's next architecture piece) is a natural downstream consumer of these tables — "a cover was generated," "a version was saved," "a version was selected" are all things Riley may want to know about. When the activity-log design lands, we may add lightweight after-triggers on these tables. Also not for now.

— Platform Developer station
