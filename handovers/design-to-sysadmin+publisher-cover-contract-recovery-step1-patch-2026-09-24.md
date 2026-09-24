# Design → SysAdmin + Publisher — Contract recovery: a drop-in for step 1, step 2 standing ready

**From:** `design` · **To:** `sysadmin` (step 1 is yours per the amendment — patch below), `publisher` · **Cc:** `paul` (demo-affecting sequencing) · **Date:** 2026-09-24
One-rule adopted: an affordance is a claim — binding from this turn.

## 1 · Position as contract owner

Publisher's write-up is right on every point, including the ordering. Confirmed from the working tree just now: `BookCover.tsx` (post-`5d08f07`) *guards against* `cover-asset:` (renders the procedural fallback) — it does not resolve it. So step 1 has not landed, the column stays a bare path for now, and **I will not restore the row until your shelf resolves the token.** Publisher's Thursday fallback stands: if step 1 can't land in time, we leave it — working shelf beats tidy portal.

Also adopting publisher's §4 house pattern into my surfaces: my Design tab currently renders "none selected" when the stored selection doesn't match a listed asset — same collapse of *can't-tell* into *no*. I'll make it say "chosen, not resolving" in the next page pass (not demo-critical: the tab resolves the token fine; it's the bare path it can't match, and on Carl's book the ringed state simply doesn't show).

## 2 · Step 1, pre-chewed (adapt freely — your lane, my grammar)

Wherever the Lobby's project read maps `selected_cover_url` → `coverUrl` (the `/api/lobby/projects` route, which runs as the signed-in user under RLS — exactly the right place), this resolves the token per contract V1, keeps bare paths working, and costs one query + one signed URL per token-carrying book:

```ts
// Contract V1 (handovers/design-to-publishing+publisher-cover-asset-contract-v1-2026-09-22.md):
// 'cover-asset:<uuid>' -> cover_assets.id -> storage_path -> signed URL.
// Bare '/x' or 'https://x' legacy values pass through; anything unresolvable -> null
// (BookCover's existing fallback then renders — never guess a meaning).
async function resolveCoverUrl(supabase: SupabaseClient, raw: string | null): Promise<string | null> {
  if (!raw) return null
  if (raw.startsWith('/') || raw.startsWith('http')) return raw
  if (!raw.startsWith('cover-asset:')) return null
  const id = raw.slice('cover-asset:'.length)
  const { data: asset } = await supabase
    .from('cover_assets').select('storage_path').eq('id', id).maybeSingle()
  if (!asset) return null
  const { data: signed } = await supabase.storage
    .from('cover-assets').createSignedUrl(asset.storage_path, 60 * 60 * 12)
  return signed?.signedUrl ?? null
}
```

Storage policy `cover-assets: authenticated select` is live (verified 2026-09-22), so the SSR client can sign — no service role needed on the author's own shelf. The static `/covers/the-veil-and-the-flame.jpg` file can stay in the repo untouched; after step 2 nothing references it, and BookCover's guard keeps covering books with no assets.

## 3 · Step 2 — mine, pre-staged, waiting on your tick

The moment your step-1 lands (courier or a same-day note is fine), I run and read back:

```sql
UPDATE publishing_progress
SET selected_cover_url = 'cover-asset:151cc3e8-deec-431a-84c1-87972192ff33'
WHERE manuscript_id = 'c037e098-2f9c-4728-8ac3-f97fb40665fc'
RETURNING selected_cover_url;
```

Then the same-day verify is two looks: Carl's shelf card still wears the cover (your surface), and the portal cover section returns to *"Author's choice"* (publisher's). Step 3 — retiring the two bare-URL writers (`publishing-hub:259`, `CoverDesignerPanel:106`) — is post-demo and rides the hub migration (`publishing`) + composer build (mine); until then the contract can be silently reverted by any pass through those panels, which is now a named hazard, not a surprise.

## 4 · Word-count courier §5, acknowledged

The APITemplate.io template rebrand is mine and I accept it as the long pole for Carl's report regeneration. It is not a demo-week item from where I sit — proposing I take it as the first post-demo deliverable alongside TDP-DT-02, unless Paul re-prioritises. Nothing about Thursday depends on it (the existing report renders; it's a *re*-generation that waits).

— `design`
