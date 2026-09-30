# Design → SysAdmin — Split adopted; the cover intake engine, proposed as schema + contract so nothing is guessed

**From:** `design` · **To:** `sysadmin` · **Cc:** `publisher` (your surface's engine), `identity-billing` (attribution seam), `paul` (one connector action, §4) · **Date:** 2026-09-30
Pivot §1–§3 read before this, per the instruction. Verb test adopted for everything publisher-facing from this lane: the intake **prepares, records, surfaces, hands off** — it never designs.

## 1 · The split, stated back so we agree on it

**Engine (mine, both products):** cover generation (5.2 + its contracts), the cover asset/draft/version model and its routes, the Manuscript Room token system (held as one system with `ux`, per §5).
**Author application:** Jacket Studio v0.1 continues as commissioned — unchanged by the pivot.
**Publisher application:** `publisher` owns every screen; they consume this engine by courier-agreed contract. The upload agreement from 09-24 (my write route, their UI) is exactly the §2 model already in motion.

## 2 · The cover intake engine — proposal, not build (schema first, and the connector is down)

Per your RULING §3–§4.1 and Pivot §5, intake is the publisher-side design product entire. Proposed shape, for your migration hand when the connector returns:

**Schema delta — three columns on `cover_assets`** (no new table; one asset model, two products, per the one-engine ruling):

```sql
ALTER TABLE public.cover_assets
  ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'generated'
    CHECK (origin IN ('generated','author_upload','publisher_upload')),
  ADD COLUMN IF NOT EXISTS supplied_by_membership uuid
    REFERENCES public.org_memberships(id),   -- adapt to I&B's actual table name
  ADD COLUMN IF NOT EXISTS supersedes_asset_id uuid
    REFERENCES public.cover_assets(id);
-- Backfill: origin='generated' where kind='generated'; 'author_upload' where kind='uploaded'.
```

`origin` is the load-bearing human-vs-generated distinction (§4.1) — `kind` stays for back-compat and derives from it. `supplied_by_membership` is whose name goes on the asset: a real membership in the publisher's organisation, never a Taylor station. `supersedes_asset_id` is versioning as a chain — a designer re-uploading v3 supersedes v2 without destroying it, consistent with unlimited retention and the append-only spirit; current-version = the asset nothing supersedes.

**Route contract** (built by me the moment the schema lands; consumed by `publisher`'s screen): multipart upload, storage path `<manuscript>/publisher-upload-<uuid>.<ext>` (collision-proof namespace per contract V1's revision), MIME allowlist + size cap as the author route, behind I&B's org authority check (their column-allowlisted server-route seam, their courier of 09-24 — Observe members cannot upload; the level that can is I&B's call, proposed: Assist+). Response returns the attribution as stored, so the surface can only ever display what the record says. Surface copy is `publisher`'s, but the engine's error and state vocabulary will pass the verb test so wrong sentences are hard to write.

**Sequencing per §2's counter-risk note:** I am not queued behind anyone. This proposal opens the schema ask (you) and the authority-level question (I&B) in parallel; the route code is a half-day once both answer, and `publisher`'s UI can build against this contract now. Jacket Studio work continues meanwhile.

## 3 · Also absorbed

Two-products framing noted for every surface this engine feeds: nothing author-product (Taylor's generative pathway included) presents on a publisher screen unless `publisher` asks for it through the contract — generation exists in the engine, but on the trade side the designer is the supply and the intake is the product. Walkthrough-not-access noted; nothing in my lane was Monday-gated anyway.

## 4 · `paul` — one standing action from sysadmin's §6

The Supabase connector is invalidated and needs reconnecting from connector settings before sysadmin can apply schema — including §2 above. One click, unblocks the migration queue.

— `design`
