# Design → SysAdmin — Option 2 executed: real demo covers, 5.2 repaired (publish needed)

**From:** `design` · **To:** `sysadmin` · **Cc:** `publisher`, `paul` (publish + push actions) · **Date:** 2026-09-22 · **Status:** Option 2 build complete; two Paul actions close it

Convention V1.2 read: marketing / marketing-hub split noted; same-word-pair cc-both rule adopted. (Found via git log — no V1.2 pointer had landed in `handovers/inbox/design/`; worth a re-drop check for other slugs.)

## 1 · Paul ruled Option 2 (in-chat, 2026-09-22)

The audit courier's decision pointer is answered and deleted from `handovers/inbox/paul/`. Executing it surfaced that "verify what's there" was optimistic — 5.2 was broken in production, twice over:

## 2 · 5.2 was dead in production — two defects, both evidenced and fixed in the DRAFT

- **Exec 134** (production mode, first observed run of the July rebuild): `Prepare Cover Prompts` read `$json` *after* the status-update Postgres node, so the entire webhook payload (genre/mood/colors/elements/title) was silently dropped — the prompt built was "…for a **Fiction** novel. **atmospheric** atmosphere. . ." This bug predates July (same topology in the original workflow): 5.2 has only ever produced generic-Fiction covers. Fixed: reads `$('Webhook').first().json.body` explicitly.
- **Exec 134/135**: OpenAI API drift — first `response_format` now rejected (400 "Unknown parameter"), then, with that removed, **400 "The model 'dall-e-3' does not exist"** — the model is retired upstream. Fixed: `gpt-image-1` @ 1024x1536, quality high. It returns base64 (never URLs), so `Prepare for Storage` now decodes b64 via `prepareBinaryData` and the `Download Image` HTTP hop + both 20s `Wait` nodes are **disconnected from the path** (nodes left in place, unwired — expected DISCONNECTED_NODE lint on 'Wait').
- Also required: 5.2's first node UPDATEs `publishing_progress` and stops silently at 0 rows — neither demo book had a row. Seeded both via `INSERT … ON CONFLICT DO NOTHING` (plain DML, the same upsert the app's cover route performs).

**Verification (draft, manual mode): exec 136 SUCCESS** (2m47s, The Signal and the Shadow) and **exec 137 SUCCESS** (2m29s, The Veil and the Flame). Quoted from the DB after both: 3 `cover_assets` rows per manuscript, each with `source` carrying full prompt + execution_id, and `storage.objects` count = 6 in `cover-assets` — every row's object present. The July hand-over's open "5.2 never observed in production" item is **closed with evidence**.

## 3 · App build (commit `549fd24`, on `main`, awaiting Paul's push)

`git show --stat 549fd24`: `src/app/api/projects/[id]/design/assets/route.ts` (+142, new) · `src/app/projects/[id]/design/page.tsx` (284 changed; net +199/−85). Push Ceremony held: explicit single-quoted paths, stage+commit one act.

- **New assets route**: GET lists `cover_assets` under RLS with 12h signed URLs (storage policy `cover-assets: authenticated select` verified present); POST checks ownership, guarantees the `publishing_progress` row, fires the 5.2 webhook fire-and-forget.
- **Page**: mock swatches deleted; real-artwork gallery (selection stores `cover-asset:<id>`, sage-deep ✓ "Your cover"); intake state in Taylor's voice with a working **"Ask Taylor for concepts"** button; "persona is working" treatment (pulsing halo, reduced-motion safe) while polling for arrival; Taylor avatar off hardcoded green onto `bg-taylor` tokens. Deliberately minimal — the full AL-UX-008 language lands with the composer build, not two days before a demo.
- Local verification: `tsc --noEmit` clean; dev-server signed-out checks correct (page 307 auth redirect; assets route clean 401).

## 4 · Demo data state (quoted)

Book 1 *The Veil and the Flame* (`c037e098…`, carl@spikeisland.tv): 3 concepts, `selected_cover_url = cover-asset:151cc3e8-deec-431a-84c1-87972192ff33` (concept 1 pre-selected — **Carl/Paul should eyeball all three signed-in and re-pick in one click if another is stronger**). Book 2 *The Signal and the Shadow* (`b33db431…`): 3 concepts, none selected — renders the gallery "ready to choose"; the generate button is live for more. Art direction per book was derived from the manuscripts (Book 2's from its actual summary; Book 1's from the trilogy's veil/flame imagery — its stored `manuscript_summary` is a stale AI-refusal artifact, flagged for `astudio` another day).

## 5 · Two Paul actions to close

1. **Publish 5.2** (n8n lane): draft "gpt-image-1 migration…" is validated by execs 136/137; until published, the page's generate button hits the broken dall-e-3 version. Read-back after publish: active version should no longer be `30a4a5f9-2036-42fc-8dc3-b2861e3ef6c0`.
2. **Push `main`** (2 commits from this chat: `41c8b6c` audit courier, `549fd24` code, plus whatever else is queued): `git log origin/main..HEAD --oneline` read-back, then push.

Then same-day verify (mine, sits open until observed): signed-in production load of both books' Design tabs showing real artwork, and one button-triggered run end-to-end. Remaining known risk after that: none on the demo path; on-camera generation stays off-plan per the ruling.

## 6 · Notes for the record

- `cover_assets.storage_path` is `<manuscript>/cover-<index>.png` with upsert — a second run per book **overwrites** the first run's objects while old rows accumulate pointing at the same paths. Fine for the demo (one run per book; do not press the button on the demo books before Wednesday without expecting art to change); the composer build gives assets unique paths.
- 5.2 still writes legacy `publishing_progress.cover_concepts` + a Taylor line into `editor_chat_history` (old studio surfaces) — left as-is deliberately; sweep decision belongs to the composer build.
- **`publisher`**: Book 1's real selected cover now exists — asset `151cc3e8…`, path `c037e098…/cover-1.png` in the private `cover-assets` bucket. For Wednesday's two-browser continuity, your portal's cover section can read it via your service-role route pattern (signed URL server-side); happy to pair on that seam post-demo as the first thread of the approval loop.

— `design`
