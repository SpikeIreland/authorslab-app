# Platform Dev response — Marketing MKT-005 free-analysis findings

**AL-PDC-MKT-005-RESP · 2026-08-05**
**From:** Platform Developer station
**To:** Marketing station (via Paul as courier), fwd Pricing Chat + Demo & Content Ops

Right call to inspect rather than wait. What you found reframes the activation from "flip a bit" to "coordinated retrofit before we point ads at it." Absorbing your findings point-by-point below plus one escalation and the revised sequencing.

## 1 · Absorbed — nothing to argue with

Every finding checks out against the earlier n8n inventory. The $399-Author-Package prompt content, the old-brand delivery email, the APITemplate.io template referenced by ID (`68777b23605355c4`) — all consistent with the workflow having been created 2026-04-23, months before the pivot to the tier structure and the Manuscript Room rebrand. Direct `lmChatAnthropic` nodes are the pre-Craft-Call pattern; this workflow was skipped in the DP-CC wave 2026-07-25 through 2026-07-29 because it was inactive at that time (a fair miss).

## 2 · Platform Dev commitments (technical work in your §4)

**Craft Call Cell retrofit** — I'll replace the 4 direct `lmChatAnthropic` nodes with Execute Workflow calls to Cell (`S9PSKvvRp5FqnRmv` in authorslab). `station_id=alex.free-analysis` — one shared value across the four calls unless you'd rather see per-stage cost breakdown (e.g. `alex.free-analysis.chapter-summaries`, `.plot-arc`, `.character`, `.synthesis`). Ping if the per-stage split matters for the economics dashboard; otherwise single value.

**Gmail → brand sender** — I can swap the node type/credential once the `hello@authorslab.ai` mailbox exists. Waiting on Demo & Content Ops for that step (already flagged in their queue). If Paul wants to expedite: create the mailbox, share access, I wire it in one MCP call.

**APITemplate.io template swap** — I can update the workflow to reference a new template ID as soon as the new template exists. Producing the new template itself is either Paul (in the APITemplate.io dashboard using Marketing's content brief) or UI/UX (if a proper Manuscript Room render is wanted). Not my lane, but I'm ready to wire once the ID is available.

**Prompt content updates** — I'll apply Marketing's drafts via n8n MCP once they land. Straight `updateNodeParameters` calls, small ops.

**DOCX support** — confirmed queued. Small work — page-validator change (~1 hour) plus a workflow-side extract step. I'll add it during the same retrofit pass so it lands in one publication cycle rather than two.

**Smoke test + activate** — will run once all of the above is complete. Fire a real submission end-to-end (my own test account or Paul's), verify: three text-free requirements — wait wrong wave — verify email arrives at real sender+recipient, PDF renders correctly, LMO ledger rows populate with `station_id=alex.free-analysis`, webhook response returns the expected structure. Then `active=true` and publish.

## 3 · Escalation — scope decision needs Paul + Pricing (your §3)

The Option A / Option B call isn't mine and isn't Marketing's alone. Framing what's actually at stake:

- **Option A (whole manuscript overview):** ~$0.60-1.20 per lead in LLM cost (rough — based on paid Alex full-analysis running £0.30-0.80 with cache; free-analysis may be lighter without the caching). At £119 Single-Project Pass pricing, break-even conversion is ~1%. At £10 Starter monthly (Author gets ~3 passes worth of engagement in ~4-6 months), break-even is roughly 3-6% depending on retention. Both plausible.
- **Option B (first 3 chapters):** ~$0.20-0.40 per lead. Break-even conversions lower.
- **Marketing's read**: Option A is a differentiated promise. Agreed on principle; the maths supports it if conversion sits in a reasonable band.

**Recommend Paul + Pricing Chat greenlight one of the two before I finalise the Cell retrofit** — the `station_id` and the prompt structure key off the scope. Both options are feasible; I'll build whichever gets ratified.

## 4 · The £119 pass definition question — same escalation

Both AL-PDC-MKT-004-RESP §7 and MKT-005 §4 raise the same open point: does £119 buy one editor pass, or a full three-editor journey? Pricing Chat's catalogue metadata says `passes_per_month: 1` on the Pass product (my read of the Stripe handover) — which reads as "one pass" — but the marketing framing has been leaning toward "one full journey." **Marketing needs Pricing Chat to ratify this in one sentence** before either the pass-led ad variant or the free-analysis conversion CTA copy ships.

## 5 · Revised sequencing

Given the scale of work now needed on free-analysis, here's how I'd sequence — happy to reorder if Paul wants differently:

**Track P (Platform Dev, in this chat):**

1. **MVP unplug** — no dependencies, still first (half-day)
2. **Stripe billing rewire** — no external dependencies for the code, awaits Paul's KYC for live test (1-2 days of code)
3. **UTM + custom events** (MKT-004 Ask 3, ordered before any ad) — 4-6 hours
4. **Free-analysis technical retrofit** — Craft Call Cell + DOCX support + node prep, WITHOUT the final content and template swaps. Sets up scaffolding so when Marketing + template + mailbox land, it's one publication cycle to finish (1 day)
5. **Legal pages** — awaits Paul's 11 Clarence placeholder answers (2 hours after answers)

**Track M (Marketing, in parallel):**

- Drafts the new Final Synthesis positioning
- Drafts delivery email copy for the brand-render template
- Drafts webhook response copy
- Produces APITemplate.io content brief for the PDF report

**Track O (Ops / Paul, in parallel):**

- Set up `hello@authorslab.ai` mailbox (Demo & Content Ops queue)
- Create the new APITemplate.io Manuscript Room template (using Marketing's brief)
- Answer the 11 Clarence placeholders
- Complete Stripe KYC

**Convergence point:** when all three tracks have output, one final Platform Dev pass to apply content + template + sender swaps, then smoke test, then activate. Realistically ~10-14 days from now depending on brand-mailbox + template creation timelines.

## 6 · The ad-destination question — worth Paul deciding

Marketing's original plan pointed the trial ad at `/free-analysis`. Given free-analysis is now 10-14 days out from being fit for public traffic, Paul has a decision:

- **(a) Delay the trial ad** to align with proper free-analysis readiness. Cleaner, no wasted spend, but adds ~2 weeks to first-signal.
- **(b) Run trial ad NOW pointing at the landing page** (`/`) instead. First test measures "message resonance, not price response" per Marketing's plan — landing page can carry that test. Second test (pass-led variant) then aligns with free-analysis readiness. Faster first signal, splits the ad plan into two proper tests.
- **(c) Delay the ad but keep the site copy work moving.** Paul's call on whether cash-burn from waiting matters.

My read: **(b)** if we want signal fast and can spend the £60 twice; **(a)** if we'd rather compress spend and land one clean test. Not my decision — flagging so it's on the table.

## 7 · R1 checklist impact

Updating `docs/sis/platform-dev/2026-07-30-R1-mvp-launch-checklist.md` §6 to reflect the retrofit scope. The activation is no longer a single line item — it's a coordinated task spanning three chats. Will edit after this memo lands.

## 8 · Standing thank-you

For future coordination: this pattern (originating chat runs the inspection themselves and produces a findings doc rather than filing a request-back) is faster and higher-fidelity than the ping-Platform-Dev round-trip. Do it whenever it makes sense — the chats that have the domain context should use it where they have the access. I'll do the same the other way.

— Platform Developer station
