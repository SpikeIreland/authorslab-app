# TDP-DT-01 · Platform request to Platform Dev

**AL-PDC-TDP-01-PR · 2026-07-30 · Taylor Design & Publishing station**
**Requester station:** Taylor Design & Publishing
**For Platform Dev's queue** (route via Paul)
**Consuming spec:** `docs/sis/taylor-dp/2026-07-30-TDP-DT-01-design-tab-cover-composer-spec.md` — approved by Paul 2026-07-30

## Context

The Design tab's cover work is being rebuilt around a two-pathway intake (Taylor-generated artwork via `5.2`, or author-uploaded images) feeding a layer-based cover composer. The founding rule: artwork and typography are separate layers — generated art is prompted text-free, and title/subtitle/author are real text layers composited at export. The full design is in the spec above; this document is the extraction of everything that lands in Platform Dev's territory: Supabase schema + RLS + storage, two n8n workflow changes, and one convention question.

**Naming caveat up front:** I've written the SQL below against `public.manuscripts` / `public.author_profiles` with the RLS idiom from your DP-AS-04 request (`author_id IN (SELECT id FROM author_profiles WHERE auth_user_id = auth.uid())`, plus `is_admin()`), since that's the established estate pattern. If the anchor entity for what the app calls a "project" is named differently, adapt freely — the shape is the request, not the identifiers.

## 1 · Proposed tables

```sql
-- Any image that can appear on a cover (generated or uploaded)
CREATE TABLE IF NOT EXISTS public.cover_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('generated', 'uploaded')),
  storage_path text NOT NULL,
  width int,
  height int,
  -- Provenance. For generated: prompt, workflow execution id, model, cost
  -- (mirrors Craft Call Cell tracking; the run id here is what the generation
  -- counter is derived from — see §5). For uploaded: original filename, mime.
  source jsonb,
  -- Deterministic bookkeeping for uploads ("I have the right to use this image").
  rights_confirmed boolean,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cover_assets_manuscript_idx
  ON public.cover_assets (manuscript_id, created_at DESC);

-- The single working composer document per manuscript (autosaved, mutable)
CREATE TABLE IF NOT EXISTS public.cover_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL UNIQUE REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  doc jsonb NOT NULL,          -- ordered layer list, logical 500×800 units
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Immutable snapshots ("Save as version"). Paul's decision 2026-07-30:
-- keep every version, no cap, no pruning.
CREATE TABLE IF NOT EXISTS public.cover_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  doc jsonb NOT NULL,
  thumbnail_path text,
  export_path text,            -- set when exported at full res (1600×2560 PNG)
  label text,                  -- optional author-given name
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cover_versions_manuscript_idx
  ON public.cover_versions (manuscript_id, created_at DESC);

-- Selection lives on the manuscript. cover_url (AL-UX-004) is set from the
-- selected version's export_path so Library/Overview light up unchanged.
ALTER TABLE public.manuscripts
  ADD COLUMN IF NOT EXISTS selected_cover_version_id uuid
  REFERENCES public.cover_versions(id) ON DELETE SET NULL;
```

Notes on shape:

- `created_by` on assets and versions is deliberate and load-bearing for the publisher-collaboration model: when a publisher later saves a version or triggers a generation, attribution must show *them* — not Taylor, not the author. It ships now so nothing is retrofitted.
- `cover_drafts` is `UNIQUE (manuscript_id)` — one working document; versions are the history. If you'd rather model drafts as a row per user for future co-editing, no objection, but it's not required by anything specced.
- No `cover_comments` table yet — versions are designed as the future comment anchors, but the table arrives with the publisher-collaboration build, not now.

## 2 · Proposed RLS

Author-only today, written so the collaborator clause is a one-line uncomment when `project_collaborators` lands (the seed brief's §4 concept — that schema is a separate, later request once the collaboration model is specced).

```sql
ALTER TABLE public.cover_assets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_drafts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_versions ENABLE ROW LEVEL SECURITY;

-- Shared predicate, worth a helper function so all three tables (and every
-- future Design/Publishing/Marketing table) use one definition:
CREATE OR REPLACE FUNCTION public.can_access_manuscript_shared_space(m_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT public.is_admin()
      OR EXISTS (
           SELECT 1 FROM public.manuscripts m
           JOIN public.author_profiles ap ON ap.id = m.author_id
           WHERE m.id = m_id AND ap.auth_user_id = auth.uid()
         )
      -- OR EXISTS (  -- uncomment when project_collaborators lands
      --      SELECT 1 FROM public.project_collaborators pc
      --      WHERE pc.manuscript_id = m_id
      --        AND pc.user_id = auth.uid()
      --        AND pc.status = 'accepted'
      --    )
$$;
```

Then per table, SELECT/INSERT/UPDATE for authenticated users gated on `can_access_manuscript_shared_space(manuscript_id)` (INSERT/UPDATE additionally `WITH CHECK` the same predicate, and `created_by = auth.uid()` on insert). DELETE: versions are immutable — no authenticated DELETE policy on `cover_versions`; assets and the draft may allow author DELETE at your discretion.

The helper function is the request-behind-the-request: it becomes the single enforcement point for the "shared-by-invitation space" across all three of this station's tabs, which is exactly the hard permission boundary the founding model demands.

## 3 · Storage

A `cover-assets` bucket (private). Paths namespaced `manuscript_id/asset_id.<ext>` for intake images, plus `manuscript_id/versions/<version_id>.png` for exports and `.../thumb.png` for thumbnails. Read/write via the same access predicate (storage policies mirroring §2, or signed URLs issued by routes that check it — your call on convention). Uploads capped 20 MB, MIME allowlist `image/jpeg`, `image/png`, `image/webp`.

## 4 · n8n workflow changes

**`5.2 Taylor Generate Covers` — two changes:**

1. **Text-free artwork prompting.** The DALL-E 3 prompt gains explicit instructions: cover *art* only — no lettering, no title, no typography of any kind, composition leaving headroom for a title block. Genre/tone/imagery direction continues to come from `5.1`'s design brief merged with the author's request. This is the substantive change; typography is now composited app-side, never generated.
2. **Write `cover_assets` rows.** Each generated image is stored to the `cover-assets` bucket and recorded as a row (kind `generated`, `source` carrying prompt + execution id + cost). If 5.2 currently returns images to the app for the app to store, moving persistence into the workflow (or an RPC it calls) is fine either way — the requirement is only that every generated image ends up as an asset row with provenance.

**`5.4 Taylor Chat` — additive contract change:**

Alongside its conversational reply, 5.4 may return an optional `edit_ops` array — Taylor's proposed composer edits as structured data:

```json
{
  "reply": "I've nudged the title up and tried a more classical face — see what you think.",
  "edit_ops": [
    { "target": "title", "prop": "fontPairing", "value": "classic-serif" },
    { "target": "title", "prop": "fontSize", "delta": "+20%" },
    { "target": "title", "prop": "y", "value": 96 }
  ]
}
```

`target`: a layer id or seeded role (`title` | `subtitle` | `author` | `scrim`). `prop`/`value`/`delta` per a whitelist the app owns. **The app validates every op against the whitelist and range-clamps before applying; invalid ops are dropped silently.** The LLM proposes, deterministic client code disposes — 5.4 needs no knowledge of the whitelist, it just emits the schema (Craft Call structured output). The same schema is used at draft creation, where Taylor pre-places the full typographic treatment ("Taylor drives, editor refines" — spec §3.2a). `5.3 Detect Cover Intent` is unchanged.

## 5 · Generation quota (build the lever, not the number)

Paul's direction (2026-07-30): generation allowance will be a **pricing lever** — professional tier gets more runs than starter. Numbers are undecided, so the request is machinery only:

- A run count derivable per manuscript: `SELECT count(DISTINCT source->>'execution_id') FROM cover_assets WHERE manuscript_id = $1 AND kind = 'generated'` — no new table needed if `source.execution_id` is reliably written by 5.2 (per §4). If you'd rather have an explicit `cover_generation_runs` table, no objection.
- The gate check lives in the app-side route that triggers 5.2, comparing the count against a config value. Until tiers exist the config is effectively unlimited; Craft Call Cell cost tracking remains the monitor.
- Nothing tier-related in the DB yet — when pricing lands, the allowance presumably joins whatever plan/subscription structure exists then.

## 6 · Division of labour

- **Platform Dev (this request):** migration (§1–§2 tables, helper function, RLS), bucket + policies (§3), the two workflow changes (§4).
- **TDP station (me, after this lands):** the Design tab rebuild — composer UI (react-konva), intake galleries, upload flow, autosave/version/select/export client logic, the `edit_ops` whitelist + applier, and the `/api/projects/[id]/design/*` route updates. One convention question below before I touch routes.
- **Not in scope for either of us yet:** `project_collaborators`, `cover_comments`, publisher dashboard — those follow the collaboration-model spec, which is this station's next architecture piece.

## 7 · Questions for Platform Dev

1. **Anchor entity naming** — confirm `manuscripts` is right, or tell me what to reference (see caveat at top).
2. **Route convention** — the existing `/api/projects/[id]/design/*` routes: happy for this station to extend them directly (cover assets/draft/versions/select endpoints), or do you want shared auth-check helpers routed through something you own? Given the §2 helper function is the enforcement point, my preference is routes call it via RLS naturally and stay thin.
3. **Asset persistence locus for 5.2** — workflow writes the rows (my default assumption) or returns payloads for an app route to persist?
4. **Storage policy style** — bucket RLS policies vs signed-URL issuance from checked routes; whichever is estate convention.

## 8 · Verification once it lands

- **Schema:** insert/select each table as the owning author in dev; confirm a second account sees nothing (RLS negative test); confirm `cover_versions` rejects authenticated DELETE.
- **5.2:** trigger a generation from the dev app; assert three text-free images in the bucket, three `cover_assets` rows with `execution_id` + cost in `source`; run the quota count query and get 1.
- **5.4:** send "make the title bigger" against a draft; assert the reply contains schema-valid `edit_ops`; assert a deliberately out-of-range op (e.g. fontSize 4000) is clamped/dropped app-side.
- **Selection flow:** save version → select → `manuscripts.selected_cover_version_id` set, `cover_url` populated, Library card shows the cover.

Meanwhile I'll build the composer against the layer-document format with local mock persistence, so when the migration lands the wiring is a final pass, not a build session.

— Taylor Design & Publishing station
