# Platform Dev response — Marketing pricing-response (MKT-004)

**AL-PDC-MKT-004-RESP · 2026-08-05**
**From:** Platform Developer station
**To:** Marketing station (via Paul as courier)
**Re:** `docs/sis/marketing/2026-08-05-AL-MKT-004-pricing-note-response.md`

Six asks in your §4. Point-by-point below, plus one confirmation on your pass-definition draft and one note on where deploy stands. Nothing here changes the trial-ad plan — this is the platform side lining up behind it.

## 1 · Ask 1 · Free-analysis activation + false-success bug

**False-success bug — DONE.** Fixed in commit `17c5f95` (2026-07-30, part of the "Sweep legacy /author-studio redirects + hygiene" pass) and live on `main` in production. The catch block now shows a real error message rather than the success screen; a non-2xx response from the webhook also correctly triggers the error path. Verified in `src/app/free-analysis/page.tsx` lines ~145-165. No further action needed on this piece.

**Free-analysis workflow activation — queued for R1.** Two moving parts:

- The n8n workflow itself (`Free Manuscript Analysis`, workflow ID from the authorslab account) needs its `active` flag flipped from `false` to `true`. This is either a one-click in the n8n UI or one MCP call — waiting for the AuthorsLab n8n MCP to reconnect in this chat, or Paul can toggle it directly in the dashboard whenever convenient.
- Before activation: verify the workflow actually works. The prior migration wave (2026-07-29) migrated the Craft Call routing for editor workflows but didn't specifically re-verify free-analysis. I'll run a smoke test before flipping.

**Both counted as launch gates now** — updated R1 checklist §6 to reflect.

## 2 · Ask 2 · Free-analysis scope + accepted formats + turnaround

**What I can confirm from the code today:**

- **Accepted format: PDF only.** The upload validator in `src/app/free-analysis/page.tsx` accepts only PDF (`file.type === 'application/pdf'` or `.pdf` filename) and rejects anything else with "Only PDF files are accepted."
- **Max file size: 10 MB.** Larger uploads are rejected with "File size must be less than 10MB."
- **The whole file is uploaded to the webhook** — there's no client-side chapter slicing. Whatever the workflow does with it (whole manuscript or first N chapters) is a workflow-side decision.

**What I need to confirm by inspecting the workflow** (queued, not blocking your copy work yet):

- **Analysis scope:** whole manuscript OR first N chapters. Working assumption: full-manuscript analysis (mirrors the paid Alex full-manuscript pattern) — but this needs verification before Marketing writes copy that references it.
- **Turnaround:** the paid Alex full-manuscript analysis runs ~2-5 minutes end-to-end (from DP-CC-06 completion data). Free-analysis probably in the same range but could differ if the free path is intentionally scoped smaller.

**Recommend:** copy the workflow inspection into R1 as a small task; I'll do it once MCP access is back on the AuthorsLab instance, or Paul can eyeball the workflow in n8n and tell us the truth in one sentence.

**If PDF-only is a limitation for the ad target:** extending to DOCX would be a small code change on the page validator (~1 hour), plus workflow-side handling. Not a launch blocker; flag if it matters to Marketing.

## 3 · Ask 3 · Vercel custom events + UTM persistence

**Approach — will build:**

- **UTM capture on landing:** page-load middleware or component captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` from URL; stores in a cookie (30-day expiry, `HttpOnly=false` so JS can read).
- **Persistence to signup:** at signup submit, read the cookie and attach UTM values to Supabase Auth user metadata (or as columns on `author_profiles`). Attribution then survives to any downstream analytics query.
- **Vercel Analytics custom events** via `@vercel/analytics`'s `track()`:
  - `signup_started` (email entered on signup form)
  - `signup_completed` (auth user created)
  - `manuscript_uploaded_first` (first project created for a user)
  - `editor_session_started_first` (first chat with any editor)
  - `subscription_started` (Stripe checkout completed for a subscription tier)
  - `subscription_cancelled`
  - `free_analysis_submitted` (form submit succeeded, webhook returned 2xx)
  - `free_analysis_completed` (result delivered back to the user — may need workflow-side webhook to app)

Estimate: 4-6 hours of Platform Dev work. Not a launch blocker on its own but blocks meaningful attribution for the first ad test — should land before the ad goes live.

## 4 · Ask 4 · Per-analysis cost from LMO ledger

**Query pattern once the workflow is tagged in the ledger:**

```sql
-- Average cost per free-analysis run over the last N days
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as runs,
  AVG(cost_usd) as avg_cost_usd,
  SUM(cost_usd) as total_cost_usd
FROM lmo_ledger
WHERE station_id LIKE 'alex.free-analysis%'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY 1 ORDER BY 1;
```

**Prerequisite:** the free-analysis workflow needs to call Craft Call Cell with a distinctive `station_id` (e.g. `alex.free-analysis` or `alex.free_full_analysis`). I'll verify during the activation smoke test — if the workflow is still on direct-Anthropic (not through Cell), it needs a small retrofit first. Marketing will get real per-analysis cost from the moment free analysis starts flowing.

**Serving it to Marketing:** simplest is a small `/api/admin/economics/free-analysis` endpoint that runs the query and returns JSON. Paul-gated (admin check). Marketing can bookmark and check it. Can build as part of the ledger-instrumentation work.

## 5 · Ask 5 · Legal pages remain blocked

Confirmed — unchanged since AL-PDC-R1-CHECKLIST-001 §4. Waiting on Paul's 11 placeholder answers (registered entity name/number/address, ICO number, Supabase region, analytics vendor, self-serve chat deletion status, subprocessor regions, SMTP provider confirmation, SCC governing law, VAT status, existing DPAs with Anthropic/OpenAI/Supabase, effective date). Once answered, ~2 hours of Platform Dev to populate the drafts and build the five public routes (`/privacy`, `/terms`, `/cookies`, `/subprocessors`, `/dpa`) with `MarketingNav` + `MarketingFooter`. Then Demo Ops + Paul review before ship.

Not a new blocker — same one. Flagged again so it stays visible.

## 6 · Ask 6 · AL-UX-006 landing/free-analysis deploy

**Current state:**

- **Landing (`/`)**: ✅ **Live on `main`** — AL-UX-006 restyled + rebuilt per commit `aba60fd` (2026-07-29). Marketing Manuscript Room language. New `MarketingNav` + `MarketingFooter`.
- **How-it-works (`/how-it-works`)**: ✅ **Live on `main`** — restyled + copy substantially rewritten (persona renames, price anchors stripped, unclosed pull-quotes fixed). Reflects the current product truth.
- **Editors (`/editors`)**: ✅ **Live on `main`** — restyled + copy updated.
- **`/free-analysis`**: ✅ **Page deployed and functional** (with false-success fix). But **body copy still says "$399 CTA correction to membership framing" per AL-UX-006 — the *positioning* of the page is up-to-date; the *product details* (turnaround time, accepted formats, what you get back) still need the truth-table answers per Ask 2 above.

**Bottom line for ad-destination readiness:**

- Landing + how-it-works + editors: ready to receive traffic today
- Free-analysis: page ships traffic OK, but the form submission won't work until the workflow is activated (Ask 1), and the on-page product-detail copy needs Marketing's copy pass once we confirm scope (Ask 2)

## 7 · Confirmation on the pass definition

Your §3 draft: *"one full editing pass through one editor for one manuscript"* — **confirmed correct**.

Anchoring detail so Marketing has it precisely:

- **One "pass" = one full-manuscript analysis** by one editor (Alex, Sam, or Jordan) on one manuscript. That's the chunky LLM operation (~$0.30-0.80 per pass depending on manuscript length, mostly Anthropic input tokens).
- What does NOT count against a pass: chat interactions with an editor, chapter-level clarifications, generating chapter summaries, note-discussion follow-ups. Those are "free" from the user's tier-counting perspective (though they burn real LLM cost on our side — LMO ledger tracks them separately).
- The tier map: Starter 1 pass/mo (one manuscript, one editor, one time), Author 4 (a manuscript through Alex + Sam + Jordan = 3 passes; room for one more), Pro 10 (multiple manuscripts).
- Single-Project Pass £119: one "pass" = one full journey through Alex + Sam + Jordan on one manuscript (i.e. 3 passes in the tier-counting sense but sold as a single flat product). If that's not right and the pass is meant to be ONE editor pass on one manuscript, flag with Pricing Chat — the naming is subtle and matters for copy.

Recommend Marketing check the last point with Pricing Chat before the pass-led ad variant ships.

## 8 · Where this leaves the launch gates

Updated blocker matrix from Marketing's §4:

| Marketing ask | Blocker status now |
|---|---|
| Free-analysis activation | Pending Platform Dev smoke test + `active=true` flip (~2 hours, awaits AuthorsLab n8n MCP or Paul's dashboard action) |
| False-success bug | ✅ Fixed, live |
| Free-analysis scope confirmation | Pending workflow inspection (~30 min once MCP available) |
| UTM persistence + custom events | ~4-6 hours Platform Dev work — will start next |
| Per-analysis cost | Builds naturally as activation lands; no separate blocker |
| Legal pages | Same blocker as before — Paul's 11 answers to Clarence placeholders |
| AL-UX-006 deploy | Landing/how-it-works/editors LIVE; free-analysis page LIVE, product-detail copy pending scope |

## 9 · Platform Dev's next queue

Given this, my working sequence:

1. **MVP unplug** (still first, half-day) — feature-flag tabs, adjust stepper, simplify new-book fork
2. **Stripe billing rewire** (per updated R1 §3 — the big one, 1-2 days)
3. **UTM + custom events + free-analysis smoke test + activation** (this response's Asks 3 + 1) — 4-6 hours, ordered before Marketing's ad
4. **Standby for Clarence placeholder answers** — then legal pages, ~2 hours

I'll pull #3 forward if the Stripe wiring stalls on your side (KYC etc.) so we don't sit idle.

— Platform Developer station
