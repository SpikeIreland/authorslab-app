# Design tab — cover pathways & cover composer spec

**TDP-DT-01 · 2026-07-30**
**From:** Taylor Design & Publishing station
**Decision owner:** Paul — pathway model and freeform-editor direction approved 2026-07-30; multi-element editor confirmed as demo target, with a "Taylor drives, editor refines" interaction model
**Status:** Approved — all §11 questions answered by Paul 2026-07-30 (quota numbers deferred to pricing) · supersedes the mock-concept cover UI in `src/app/projects/[id]/design/page.tsx`

---

## 0 · The decision

The Design tab's cover work is rebuilt around two intake pathways feeding one editor:

1. **Design in-house** — Taylor generates cover artwork via the OpenAI account (existing `5.2 Taylor Generate Covers` workflow, modified per §4).
2. **Bring your own** — the author uploads an image they've made or commissioned.

Either way, the author lands in a **cover composer**: a freeform, Canva-like editing surface where artwork and text live on separate layers and the author drags, resizes, and styles elements directly. The freeform editor is the destination; the build is staged (§6) so the September Jacky Klein demo rides on the stable core, not the long tail.

### The founding architectural rule: artwork and typography are separate layers

DALL-E 3 renders text badly — garbled letters, misspellings, unfixable without regenerating the whole image. So **no pathway ever bakes title text into the artwork**:

- Generated artwork is prompted explicitly as *text-free* cover art (§4).
- Uploaded images are treated as the artwork layer; if an author uploads a finished cover with text already on it, that's allowed (it's their book), but the composer's text layers are how titles are meant to be set.
- Title, subtitle, and author name are real text layers composited in the editor and rendered crisply at export resolution.

Consequences: instant title edits without touching artwork; typography that can match the book's interior; both pathways get the identical editing experience; and the editor becomes the unifying object of the tab rather than an accessory.

---

## 1 · Scope

**In scope:** the Cover section of the Design tab — intake, composer, versioning, selection, export. Data model and API shape for all of it. Taylor-chat integration with the composer.

**Out of scope (explicitly deferred):** full print wrap (spine width, back cover, bleed, trim); front matter / back matter / interior format sections (remain "coming soon"); the Design tab's Manuscript Room reskin as a whole (that's a separate brief to the UI/UX Design chat — though everything specced here uses the AL-UX-004 tokens so it lands already-native); publisher commenting UI (hooks are designed in §8, UI comes with the publisher-collaboration build).

---

## 2 · Current state (for the record)

`design/page.tsx` today: three-panel layout (sections rail / cover grid / Taylor chat), four **mock colour-swatch concepts**, selection persisted via `/api/projects/[id]/design/cover`, chat wired to `/api/projects/[id]/design/chat`. "Generate more concepts" is a disabled stub. The n8n side (`5.1` assessment, `5.2` generate covers, `5.3` intent detection, `5.4` chat) is migrated to Craft Call architecture but not connected to this UI.

Pre-redesign styling throughout — slate palette, blue selection rings, and Taylor's avatar hardcoded to green `#1D9E75`. Per AL-UX-007 (which superseded the AL-UX-004 clay value), Taylor's colour is **gold `#BC9440`** — build to the shipped tokens (`bg-taylor` / `bg-taylor-light` / `text-taylor-text`), never to hex. All of this is corrected as part of this build. *(Corrected 2026-07-30 per AL-UX-RESP-TDP-UX-01 C1 — this line originally cited clay `#A98A6B` from the pre-AL-UX-007 map.)*

---

## 3 · The composer

### 3.1 Canvas

- Fixed 5:8 aspect (ebook cover), logical canvas 500×800 units, rendered responsively.
- Export target **1600×2560 px** (KDP-recommended ebook size, and comfortably above IngramSpark ebook needs). All layout is stored in logical units and scaled at export, so export resolution is a constant, not a rebuild.
- Recommended library: **Konva via react-konva**. Mature, React-native API, handles drag/transform/z-order/hit-testing, and exports to PNG at arbitrary `pixelRatio` — which makes client-side export at 1600×2560 a one-liner. (Fabric.js is the alternative; Konva's React bindings fit the codebase better.)

### 3.2 Layer model

Every draft is a JSON document — an ordered list of layers:

| Layer type | Properties | Notes |
|---|---|---|
| `artwork` | asset ref, crop rect, scale, position | Exactly one; bottom of the stack. Generated or uploaded. |
| `scrim` | gradient/solid, colour, opacity, region | Optional legibility aid over busy artwork. |
| `text` | content, x/y, width, font, size, weight, colour, letter-spacing, line-height, align, rotation | Three seeded roles — `title`, `subtitle`, `author` — plus arbitrary additional text boxes (freeform). |
| `image` | asset ref, x/y, scale, rotation, opacity | Freeform: publisher logo, award badge, illustration fragment. |
| `shape` | rect/line/ellipse, fill, stroke, position | Freeform: rules, panels, frames. |

The three seeded text roles are created automatically from project metadata (title, subtitle, author name) whenever a draft is created, so no author ever starts from a blank canvas — they start from a plausible cover.

### 3.2a · Taylor drives, the editor refines (confirmed interaction model)

The composer is not a blank tool the author must master — Taylor sets the starting point and the author polishes. Concretely: when a generated concept (or uploaded image) is opened in the composer, Taylor **pre-places the typography** — font pairing, sizes, colours, and placement chosen from her `5.1` design brief plus a palette read of the artwork. Mechanically this is the same `edit_ops` schema as chat-driven editing (§7), applied at draft creation: Taylor proposes a full typographic treatment as structured ops, the deterministic client applies them. The author then drags, restyles, and asks Taylor for revisions from there. The persona stays central ("I've set the title in something classical to match the tone — move it around, or tell me what to change"), and the editor reads as refinement, never as homework.

### 3.3 Interactions

Drag to position; corner handles to resize (text resizes by font size, images by scale); rotation handle; snap guides to canvas centre-lines, thirds, and margins; z-order controls; multi-select is **not** required (single-selection keeps the transformer simple). A right-hand properties panel shows the selected layer's controls; a thin layers list allows reorder/hide/delete.

**Guardrails that keep freeform from producing bad covers:**

- **Curated font pairings** — a set of ~8 display/support pairings Taylor recommends (serif-led, consistent with the Manuscript Room's Iowan/Palatino display voice), not an open font menu. An "all fonts" escape hatch can come post-demo.
- **Palette from the artwork** — on artwork load, extract a 6-swatch palette (dominant + accents) and offer it as the default text-colour choices, with a full picker behind it.
- **Safe margins** — visible margin guides; a soft warning (not a block) when text crosses them.
- **Contrast nudge** — if a text layer's contrast against its backing region falls below ~3:1, show a hint suggesting the scrim. Advisory only.

### 3.4 Autosave, versions, selection

- The working draft autosaves (debounced) to `cover_drafts.doc`.
- **"Save as version"** snapshots the JSON + a rendered thumbnail into `cover_versions` — immutable. Versions are the gallery the author compares, the object a publisher will later comment on, and the demo's "look how far we've come" beat.
- **"Use this cover"** marks a version as the project's selected cover: triggers a full-resolution export (§5), stores it, and sets `projects.cover_url` — which immediately lights up the Library book cards and the Overview book object (AL-UX-004 already slots `cover_url` in).

---

## 4 · Pathway A — design in-house (Taylor generates)

1. Entry: "Ask Taylor for concepts" button, or a chat message that `5.3 Detect Cover Intent` routes to generation.
2. `5.1 Taylor Assessment`'s design brief (genre, tone, audience, imagery direction) seeds the prompt. The author's specific request ("something with a lighthouse, muted colours") is merged in.
3. **`5.2 Generate Covers` is modified to prompt for text-free artwork**: explicit instructions to produce cover *art* with no lettering, no title, no typography, composition leaving headroom for a title block. This is the one substantive change to the workflow.
4. Three concepts per run (current behaviour), each stored as a `cover_assets` row (kind `generated`, with prompt + workflow-run metadata for provenance/cost tracking).
5. Concepts render in the tab as a gallery; "Open in composer" creates a draft with that artwork + the three seeded text layers.
6. Regeneration is always available and cheap to reason about because artwork is decoupled from any typography work already done — an author can swap the artwork layer under an existing text arrangement.
7. Each generation run increments a per-project counter checked against a plan-tier allowance (see §11.4 — quota is a future pricing lever; unlimited until tiers exist, but the counter and check ship from day one).

**Known constraint:** DALL-E 3 portrait max is 1024×1792 — below the 1600×2560 export target. For September this is acceptable (screen-quality, and the demo is screen-based). Post-demo, an upscale step (e.g. Real-ESRGAN or a ConvertAPI/Replicate upscaler) slots between generation and asset storage. Flagged, not built.

## 5 · Pathway B — bring your own + export pipeline

**Upload:** JPEG/PNG/WebP, ≤20 MB. Stored in a Supabase Storage bucket (`cover-assets/`), row in `cover_assets` (kind `uploaded`). Below 1600px on the short edge → accept with a resolution warning ("fine on screen; may look soft in print"). A one-line rights confirmation on upload ("I have the right to use this image") — deterministic bookkeeping, stored on the asset row.

**Export:** the draft JSON is the source of truth. Export renders the Konva stage at `pixelRatio` scaled to 1600×2560 and uploads the PNG to storage. Client-side export is deterministic *enough* (same engine that rendered the editing view; fonts loaded via `document.fonts.ready` before render). If cross-device font variance ever bites, the fallback is a server-side render of the same JSON — the data model doesn't change, so this is swappable later.

---

## 6 · Build stages

**Stage 1 — the core composer (demo-critical):** intake for both pathways, canvas with artwork + scrim + the three seeded text layers, drag/resize/style with curated fonts and artwork palette, autosave, versions, selection + export, `cover_url` flowing to Library/Overview. This is a complete, honest feature on its own.

**Stage 2 — multi-element freeform (demo-committed):** arbitrary text boxes, image layers, shapes, layers panel with reorder/hide, snap-guide polish. Nothing in Stage 1's data model changes — freeform is *additive layer types* on the same document format, which is why the staging is safe. Per Paul's decision (2026-07-30, confirmed twice) the richer multi-element editor **is the demo target**, so Stage 2 is on the September critical path — Stage 1 is the internal milestone that de-risks it, not an alternative demo.

**Stage 3 — post-demo:** generation upscaling, "all fonts" escape hatch, server-side export if needed, print-wrap groundwork.

Recommend holding a hard "demo freeze" on this surface ~1 week before the Jacky session; if Stage 2 is genuinely mid-flight at freeze, Stage 1 remains the structurally-complete fallback — but the plan of record is to demo the multi-element editor.

---

## 7 · Taylor chat integration

Taylor's chat panel stays alongside the composer, and gains the demo's best moment: **chat-driven editing**.

- Author: "make the title bigger and try something more classical."
- `5.4 Taylor Chat` (via the Craft Call Cell) returns, alongside its conversational reply, an optional structured `edit_ops` array: `[{target: "title", prop: "fontSize", delta: "+20%"}, {target: "title", prop: "fontPairing", value: "classic-serif"}]`.
- The client validates ops against a whitelist of targets/props/ranges and applies them to the draft. Invalid or out-of-range ops are dropped silently; the applied result is what autosaves.

This keeps the stochastic/deterministic boundary clean: **the LLM proposes, the whitelist disposes.** Taylor never mutates state directly; she emits suggestions in a schema, and deterministic client code applies them. Cover-generation requests keep routing through `5.3` intent detection as today.

### Stochastic / deterministic bounds (standing SIS principle, applied here)

| Deterministic (provably correct) | Stochastic (allowed to vary) |
|---|---|
| Draft/version storage, selection state | Artwork generation |
| Export rendering & resolution | Design-brief content from `5.1` |
| Edit-op validation & application | Taylor's conversational replies |
| Upload validation, rights bookkeeping | Proposed `edit_ops` (pre-validation) |
| Palette extraction, contrast math | Font-pairing/colour *recommendations* |

All stochastic calls via the Craft Call Cell (`S9PSKvvRp5FqnRmv`); the OpenAI image call inside `5.2` follows whatever pattern the HTTP-nodes ratification (AL-SIS-HN-001-R) established for non-Anthropic calls.

---

## 8 · Data model

```sql
-- Any image that can appear on a cover
create table cover_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  kind text not null check (kind in ('generated','uploaded')),
  storage_path text not null,
  width int, height int,
  source jsonb,               -- prompt, workflow run id, cost — for generated
  rights_confirmed boolean,   -- for uploaded
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- The single working document per project (autosaved)
create table cover_drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  doc jsonb not null,          -- ordered layer list, logical units
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

-- Immutable snapshots ("Save as version")
create table cover_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  doc jsonb not null,
  thumbnail_path text,
  export_path text,            -- set when exported at full res
  label text,                  -- optional author-given name
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- Selection lives on the project
alter table projects add column selected_cover_version_id uuid
  references cover_versions(id);
-- cover_url already exists per AL-UX-004; set from the version's export
```

**Permissions, designed forward:** every RLS policy and API route on these tables is written from day one as *author OR accepted collaborator* — i.e., against the coming `project_collaborators` table, stubbed now as author-only with the collaborator clause commented and ready. `created_by` on assets and versions is deliberate: when a publisher generates or saves something, attribution must show *them*, not Taylor and not the author. This is the seed brief's presence requirement landing in the data model rather than being retrofitted.

Schema request goes to the Platform Dev chat per the coordination model (they own Supabase changes); this section is the request's content.

---

## 9 · Publisher-collaboration hooks (designed now, built later)

- **Versions are the comment anchors.** A future `cover_comments` table references `cover_versions.id` + author (user id) — a publisher comments on *a specific version*, attributed by name.
- **The version gallery is the shared artefact.** When the Design tab becomes shared-by-invitation, the publisher sees the gallery and selected state — the working draft's live canvas can remain author-only initially (simpler than live co-presence, and matches how publishers actually review).
- **Everything a publisher touches is already attributed** via `created_by`.

This is why Design-tab-first was the right call: the composer defines the objects (versions, assets, selections) that the whole collaboration model will hang off.

---

## 10 · September demo path

The demo beat, in Taylor's voice: manuscript finished → Taylor's design brief → "I've drafted three concepts, take a look" → open one in the composer → drag the title, author asks Taylor in chat to "make it more classical" and the cover visibly changes → save version → Use this cover → the book object in the Library/Overview now wears it. End-to-end, every step real.

**Must-have:** Stage 1 complete, both pathways, Taylor's pre-placed typography on draft creation (§3.2a), chat-driven `edit_ops` for at least fontSize/colour/pairing/position on the seeded layers, `cover_url` flow to Library, Stage 2 multi-element editing (demo-committed per §6).
**Should-have:** scrim layer, contrast nudge, layers-panel polish.
**Cut freely:** upscaling, all-fonts, server-side export, any publisher UI (that's the separate collaboration stub workstream).

---

## 11 · Decisions (Paul, 2026-07-30)

1. **Version retention — keep every saved version.** No cap, no pruning. The gallery UI should therefore paginate/scroll gracefully rather than assume a small set.
2. **Uploaded finished covers — always seed the three text layers and let the author delete.** No detection heuristics, no special upload mode; one consistent draft-creation path for every artwork source.
3. **Curated font pairings — this station proposes the ~8 pairings.** Follow-up deliverable for this chat (TDP-DT-02); shared with the UI/UX Design chat for awareness, not approval.
4. **Generation quota — deferred; will be a pricing lever.** Paul's direction: generation allowance should differ by package tier (a professional package gets more generations than a starter price). Design consequence now: quota enforcement is built as a **deterministic, per-project counter checked against a plan-tier config value** — not hardcoded, not absent. Until tiers exist, the config value is effectively "unlimited" and the Craft Call Cell's cost tracking is the monitor. When pricing lands, the lever is a config change plus a "generations remaining" affordance in the UI, not a rebuild. Final numbers stay open with Paul.

## 12 · Coordination

- **Platform Dev chat:** §8 schema + RLS, the `5.2` text-free prompt change, `edit_ops` addition to `5.4`'s Craft Call contract.
- **UI/UX Design chat:** reskin brief for the Design tab shell (this spec constrains the cover section's information architecture; visual language is theirs), plus open question 3.
- **Demo & Content Ops chat:** confirm which manuscript/account carries the cover demo beat, so Stage 1 testing happens on the demo project early.

## 13 · Addendum — UI/UX Design response received (2026-07-30, AL-UX-RESP-TDP-UX-01)

The reskin request (TDP-UX-01) was accepted. Binding outcomes for this build:

- **AL-UX-008** (Design tab / composer brief) arrives within days; **AL-UX-009** (Publishing + Marketing) trails. Immediately unblocked without waiting: shell token pass and the Taylor colour correction per §2's corrected line.
- **Kai's colour is mulberry `#8E4A72`** (`kai` / `kai-light` / `kai-text` tokens ship in AL-UX-008). Riley keeps russet on the Ghostwriter side — colour follows the person.
- **"Persona is working" becomes a state-grammar standard** (pulsing halo + voiced label + optional progress meter, `prefers-reduced-motion` respected) — defined in AL-UX-008; the composer's generation-in-progress state uses it rather than inventing one.
- **Font pairings:** TDP proposes (TDP-DT-02), UI/UX reviews with a brand-coherence veto; presentation is **named-style cards** with live specimens, never raw font menus.
- **Publisher-presence slot:** reserve exactly two affordances — presence indicator in the tab header's right cluster, comment anchor zone on version cards. Nothing more until the collaboration model is specced.
- **No imprint-aware composer variant** for the Klein demo (AL-UX-005 posture: restrained layer + curated demo covers). Revisit only if PD-6 changes the imprint SKU shape.
- **Sequencing constraint (C2):** the Riley→Kai rename must NOT ship from this station's build in isolation — the public site and studio still present Riley as the marketing persona. The rename lands together with UI/UX's AL-UX-009 site/studio sweep; this build's merge window gets flagged to Paul for sequencing, and `EDITOR_CONFIG`'s "Marketing Agent" name becomes "Kai" in that same coordinated change (Platform Dev's mechanics).

— Taylor Design & Publishing station
