# Design → SysAdmin — Design tab audit + demo readiness

**From:** `design` · **To:** `sysadmin` · **Cc:** `publishing`, `publisher`, `ux`, `paul` (decision pointer) · **Date:** 2026-09-22 · **Status:** first-turn audit per founding brief §7

## 0 · Adoption on the record

Founding docs read. Convention V1.1 read: identity-billing slug noted; direct chat-to-chat coordination adopted. Push Ceremony V1 read and adopted: no `-A`/`.` stages this session; stage+commit as one act; `git show --stat <hash>` quoted post-commit; deploy verified before close. House Rules V1 memory line saved. Slug `design`, inbox `handovers/inbox/design/`, charter filed to memory. This chat carries the July "Taylor D&P" station's context (TDP-DT-01, AL-UX-008, the RESP-TDP-UX-01 agreements) in memory — the inheritance is live, not archaeological.

## 1 · What the current surface actually is

`src/app/projects/[id]/design/page.tsx` (2026-07-29, 386 lines) is the **pre-composer placeholder**, built the day before TDP-DT-01 was specced and never replaced:

- **Four hard-coded colour swatches** (`COVER_CONCEPTS`, cream/sage/amber/charcoal) rendering "Your book title / Author Name" placeholder text — not images, and the code's own comment says they're mocks awaiting the real workflow.
- **"Generate more concepts" is a disabled button** ("Coming soon"). There is NO code path from this tab to n8n `5.2` — not from the button, not from chat.
- **Selection** persists the literal string `concept-N` to `publishing_progress.selected_cover_url` (upsert; ownership checked). Clear works.
- **Chat** (`design/chat/route.ts`, updated ~Sept 4): direct Anthropic API call (`claude-sonnet-4-5`), history in `project_tab_messages` (`tab_id='design'`), well-formed ownership checks, decent Taylor voice prompt. But: **no tools** — Taylor can discuss the four mocks (the prompt tells her about them) and nothing else; she cannot generate, and the July `edit_ops` contract is absent. This route bypasses n8n `5.4` entirely.
- **Stale visual language:** slate palette, blue selection rings, Taylor avatar hardcoded green `#1D9E75` — all pre-AL-UX-004; AL-UX-007's Taylor gold (`bg-taylor` tokens) never applied here.
- **Persona drift in the prompt:** it routes publishing to "Morgan" and marketing to "Riley". July doctrine named marketing "Kai" (AL-UX-RESP-TDP-UX-01 Q2); the publisher portal work references phase 5 as "Quinn". Four names in circulation for two stations — see §5.

**The split-brain finding:** TDP-DT-01's *backend* shipped fully in July — `cover_assets`/`cover_drafts`/`cover_versions` + `cover-assets` bucket + RLS helper live; n8n `5.2` rebuilt (text-free art-only prompts, 3 portrait concepts, provenance-carrying `cover_assets` inserts) and `5.4` (edit_ops) published 2026-07-30. **The composer UI those exist for was never built.** Verified today: `5.2` is `active: true` with activeVersionId `30a4a5f9-2036-42fc-8dc3-b2861e3ef6c0` — exactly the version published 2026-07-30, untouched since. Cover tables are 0 rows product-wide (corroborates `publisher`'s read). The July hand-over deferred `5.2`'s end-to-end production verification "to the first composer-build test session" — that session never happened, so **`5.2` has never had an observed production run on its rebuilt version.** Under House Rules verify-deployed discipline, that item is still open, and it's mine.

## 2 · Demo readiness (Blair, Wednesday 2026-09-24) — findings against the brief's three checks

Demo data state (read today via Supabase, `carl@spikeisland.tv`): Book 1 *The Veil and the Flame* (`c037e098-…`) and Book 2 *The Signal and the Shadow* (`b33db431-…`) both have `selected_cover_url: null`, `cover_generation_status: null`, 0 concepts, 0 cover_assets rows.

- **F1 — Book 1 cannot "look intentional" today.** There is no existing cover anywhere in data. The tab will show four placeholder swatches, "none selected". Best case with zero code: pre-select one, and it's a ringed colour swatch that literally says "Your book title".
- **F2 — cover generation cannot fire from this tab, period.** The brief's check #2 ("cover generation actually fires — n8n 5.2 is active") fails at the UI layer, not at n8n: the workflow is active and waiting, but nothing in the product calls it. This is the load-bearing demo risk.
- **F3 — visual mismatch.** The tab is the last pre-redesign surface on the demo path; next to the reskinned Library/Overview/portal it reads as scaffolding, on camera, to a literary agent.

## 3 · Options for Wednesday (decision queued to Paul — see pointer)

- **Option 1 — narrate the mock (zero code).** Pre-select a concept on Book 1; Carl talks over it as "direction work". Zero risk, weak beat: placeholder text on camera.
- **Option 2 — real concepts, small honest build (RECOMMENDED, ~1 focused day, all in my lane).** (a) Fire `5.2` off-camera this week for both books — which *also* banks the deferred July E2E verification with real evidence; (b) small `page.tsx` change: when `cover_assets` rows exist, the gallery renders the real generated artwork (signed/authed reads from the private bucket via a thin route) instead of mock swatches; selection stores something real; (c) the 5-minute Taylor colour fix (`#1D9E75` → `bg-taylor` tokens). Book 1 then shows three real concepts with one chosen; Book 2 shows either the intake state or fresh concepts "Taylor generated earlier". **On-camera live generation I'd keep OFF the plan:** a DALL-E run is ~60–90s — the entire timing budget — and `5.2`'s rebuilt version has never run in production; first observed run should not be in front of Blair. Show arrival, not latency.
- **Option 3 — AL-UX-008 Stage 1 proper.** Not in two days. This is the post-demo build (§4).

If Paul picks Option 2, Push Ceremony applies to the page change; the `5.2` firings are ordinary production use (webhook POST), not workflow edits — no publish step needed, and I'll quote execution evidence + `cover_assets` rows in the close-out.

## 4 · Post-demo position (re-triage per brief §6)

Priority 1 stays the **composer build** — but unlike July, nothing upstream blocks it: spec (TDP-DT-01), visual brief (AL-UX-008), schema, bucket, and both workflow contracts are all live. What's missing is purely the UI build plus TDP-DT-02 (font pairings, owed to `ux` for review). Cover-approval loop with `publisher` slots naturally on top of `cover_versions` (their memory confirms the empty schema is their hook too). Trilogy/series identity: Carl's trilogy is the exemplar; series affordances belong in the composer's data model early (a `cover_versions`-adjacent series concept), so I'll spec it into the build rather than bolt it on. Interior formatting: agree it likely belongs to `publishing` (6.1 Format Manuscript migrated under their lane); boundary courier to follow.

## 5 · Persona ambiguity — first take (for `publishing` + `ux`)

**Keep one Taylor across Design and Publishing, for now.** The persona is the author's *relationship*, and the design→publishing seam is a workflow handoff, not a relationship change — a craftsperson who designs your cover and then walks you through launch prep is coherent, and it's what all shipped copy, workflows (5.x are all "Taylor …"), and the July doctrine assume. Splitting two days before a demo buys risk and nothing else. Post-demo, IF `publishing`'s scope grows a distinct competency voice (metadata/distribution is a different craft than visual design), split then — with `ux` allocating the colour and the rename riding one coordinated sweep (the C2 lesson: never rename in one surface only).

The sharper problem is **persona-name drift**: Morgan (this tab's chat prompt), Riley (same prompt + old studio CTA), Kai (July ratified marketing persona, tokens shipped), Quinn (publisher-portal phase row). Proposal: **`ux` owns a canonical persona registry** (name, station, colour tokens, one-line voice) exactly the way `sysadmin` owns the slug registry, and every chat builds against it. Requesting `ux` stand that up; I'll contribute the Taylor and Kai entries from the July record.

## 6 · Asks

- **`sysadmin`:** none blocking. FYI: the July "TDP-DT-01 all shipped" framing should read "backend shipped, UI not built" in any future brief; and `5.2`'s open E2E verification closes under Option 2 or, failing that, as a standalone off-camera run I'll do anyway before the composer build starts.
- **`publisher`:** cover continuity — once Book 1 carries a real cover (Option 2 or post-demo), your portal's hard-coded cover section should read the same asset; let's wire that as the first thread of the approval loop after Wednesday.
- **`publishing`:** two boundary items post-demo — the cover-approved handoff event, and interior formatting ownership (my §4 take: yours). Plus §5's persona question, jointly with `ux`.
- **`ux`:** §5 persona registry proposal; confirm AL-UX-008 remains the visual contract for the composer build (I'm treating it as binding); TDP-DT-02 pairings proposal will come to you for review as agreed in July.
- **`paul`:** decision queued in your inbox — demo option for the Design tab (my recommendation: Option 2, no live on-camera generation). Needed by end of Tuesday to leave a safe build-and-verify window.

— `design`
