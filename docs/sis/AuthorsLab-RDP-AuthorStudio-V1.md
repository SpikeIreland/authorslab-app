# Route Definition Pack — Author Studio Line · V1

**S2 artifact · AL-RDP-001 · 2026-07-22** · Spike Island Studios
Bundles the four S2 artifacts (route definition · journey definitions · gate
register · subscription map) for the Author Studio line. Consumes: AL-IOS-001,
Line Charter V1 (D1–D10), station palette (Clarence Design V2 Appendix A).
**AS-DESIGNED vs AS-BUILT is marked throughout; every delta is a numbered
dispatch in §6 — this pack IS the build queue for the line.**

---

## 1 · The route, stations typed (RDP)

One line, three phase segments (developmental → line_editing → copy_editing),
identical internal structure per segment, free movement between them (F-008:
gates control output quality, not navigation).

```
DOCK: manuscript enters (from Intake store or Ghostwriter via D3 desk)
  trace: manuscript_id adopted · 5 editing_phases rows created, phase 1 active
   │
   ▼  per phase segment (× Alex / Sam / Jordan) ──────────────────────────┐
   │                                                                       │
   │  [CRAFT] Full-manuscript analysis        → ◇ G-AS-A  analysis gate    │
   │     └ internal CAROUSEL: chapter summaries, "chapter n of N"          │
   │  [CRAFT] Chapter analysis (on demand)    → ◇ G-AS-C  chapter gate     │
   │  [CRAFT] Editor chat (advisory)          → ◇ G-AS-D  delivery gate    │
   │                                                                       │
   │  [BUFFER] "With the author" — waiting here is NORMAL (days-scale;     │
   │     stall clocks calibrated accordingly, not step timeouts)           │
   │                                                                       │
   │  [CAROUSEL · D6] per chapter: author reads/edits (material intake)    │
   │     → [DESK] Author approves chapter (D9 owner key · D10 actor)       │
   │     counter: "chapter n of N approved"                                │
   │                                                                       │
   │  [MACHINING] Collate approved snapshot → manuscript_versions          │
   │  ◇ G-AS-P  PHASE-EXIT GATE (first-class; today a soft code check)     │
   └──────────────────────────────────────────────────────────────────────┘
   ▼
OUT: EDITED MANUSCRIPT → Design line (and Script line, D1/D8)
```

Station census per segment: 3 Craft, 1 Machining, 1 Desk (inside carousel),
2 Carousels, 1 Buffer, 4 Gates. Line total: 9 Craft, 3 Machining, 3 Desks,
6 Carousels, 3 Buffers, 12 Gates (3 phase-exit + 9 analysis/chat class).

## 2 · Journey definitions (JD)

Five journey types run on this line. **AS-BUILT has no journey records at all**
(F-013: completion inferred by polling; no scan-on-arrival, no reaper). The
spine of this section is therefore one new mechanism: an `as_journeys` table —
journey_id minted at submission (scan on arrival, P4), status transitions
written by the worker (polls stay pure reads, P5), reaper closes the
abandoned (corpse on every path, law 4).

| J# | Journey | Steps (→ = timeout to reach next) | Step timeouts (initial — calibrate at commissioning) | Terminals |
|---|---|---|---|---|
| J1 | Full-manuscript analysis (per editor) | submitted → received → summarising (carousel, per-chapter) → analysing → persisted → gated → **ready** | receive 30s · per-chapter 90s · full analysis 8min · overall 20min, size-scaled ≥80k words ×2 (Heavy-Bay divert candidate) | ready · failed (corpse w/ reason) · reaped (timeout corpse) |
| J2 | Chapter analysis | submitted → received → analysing → issues filed → gated → **ready** | receive 30s · overall 3min | ready · failed · reaped |
| J3 | Editor chat | submitted → received → replied | overall 90s | replied · failed · reaped |
| J4 | Chapter approval (deterministic, author-side) | approve → recorded (actor per D10) → counts updated | instant; no timeout — lives in the Buffer | recorded |
| J5 | Phase transition | requested → all-approved verified → snapshot created → version generated → next phase activated → **complete** | verify 10s · snapshot 60s · version webhook 5min · overall 8min | complete · rejected (gate, w/ unapproved list) · failed · reaped |

**Trace keys:** `manuscript_id` = the line barcode (adopted at dock, never
re-badged — law 3). `journey_id` = per-run key minted at submission; carried
in the n8n call payload and written back by the worker. Chapter-scoped
journeys also carry `chapter_id`. No ID round-trips through an LLM.

## 3 · Gate register (GR)

Pass criteria are cheap and deterministic — counts, states, schema. Never
routine AI-inspecting-AI. Every gate declares its reject path. "Watching" =
display-only until enforcement ships (honesty grammar).

| Gate | Boundary | Pass criteria (deterministic) | Reject path | AS-BUILT |
|---|---|---|---|---|
| G-AS-A1/A2/A3 | After full-manuscript analysis (Alex/Sam/Jordan) | Expected artifact fields non-null for the phase · issue rows well-formed (severity ∈ set, chapter ref valid) · per-chapter coverage count == chapter count | Retry wave (1 auto-retry) → else journey failed + UCO honest notice + needs-fix entry | ✗ none — analysis "done" is unverified today (ready-is-a-state, P6) |
| G-AS-C1/C2/C3 | After chapter analysis | ≥0 issues filed AND journey persisted marker set for (chapter, phase) · severity valid | Retry once → failed corpse + UI notice | ✗ none |
| G-AS-D1/D2/D3 | After chat reply | Reply row exists in editor_chat_messages within timeout | Timeout → reaped + "editor unavailable" honest message | ◐ implicit (UI error state only) |
| G-AS-P1/P2/P3 | Phase exit (the 3 grammar-required diamonds on Rev C) | approved count == chapter count (with D10 actors present on every approval) · snapshot row exists for phase · next phase activated with started_at · phase_status timestamps sane (inv_04 clean for this ms) | Reject returns the named unapproved-chapter list to the author (no silent partial transition); nothing advances | ◐ soft code check (areAllChaptersApproved) — promote to first-class with reject surface |

Ladder note: G-AS-P criteria overlap inv_03/04/05 sensors — this is the
assurance ladder working as designed: the sensor that notices (live since
2026-07-22) becomes the gate that prevents (this spec), and count==count can
later become a DB constraint (impossible).

## 4 · Subscription map (SM) — the signal layer wired

Derived from AL-IOS-001's signal rows. Emit targets assume the `as_journeys`
mechanism plus the existing production_control schema; UCO per Clarence C1
pattern (instant deterministic ack; state-driven updates; no AI prose to
users without a gate).

| Event (station/journey) | → Office | Signal |
|---|---|---|
| Craft complete/fail (any) | LMO | model, tokens, cost per call (ledger row) — feeds the model register |
| Craft complete/fail (any) | QCO | event telemetry (replaces dead workflow_executions — commission or drop resolves to: THIS commissions it or supersedes it) |
| Journey failed / reaped | QCO + UCO | corpse to QCO register · honest notice to author ("hit a snag — we're on it"), deterministic template |
| J1 submitted on large ms (>80k words) | UCO | "large manuscript — careful processing; we'll email when ready" (Heavy-Bay/Buffer pattern, Clarence C4) |
| J1 ready | UCO | completion notice (in-app + email lens over one notifications row) |
| Approval recorded (J4) | QCO | audit event: chapter, phase, actor (D10) |
| Phase gate pass (J5) | UCO + QCO | phase-complete notice to author · gate pass count |
| Phase gate reject | QCO | reject + reason (unapproved list size) |
| SPC sample (per J1/J2 per chapter) | QCO | accept-latency, edit-distance-before-approve, regenerate count — the Alex control-chart pilot feed |

## 5 · Conveyor register (shared assets, owners)

| Conveyor | Owner | Change control |
|---|---|---|
| Supabase schema (public) | SIS SysAdmin (this chat, then successor) | Migrations only; new tables ship with policies + owner question (D7) |
| `n8n-config.ts` (webhook map) | Platform developer chat | Single source of truth; additions PR'd with I/O Schedule tag reference |
| production_control schema | SIS / QCO | Invariant numbers allocated by SysAdmin only |
| manuscripts + chapters tables | Author Studio line (primary) — Design/Script/Publishing read | Readers never write; writes only via owning line's stations |
| notifications ledger (when built) | UCO | The one door for user-facing messages |

## 6 · Grammar validation + THE DISPATCH QUEUE

**AS-DESIGNED validates:** every Craft station has a gate at its next boundary
✓ · every gate declares pass criteria + reject path ✓ · loops carry counters ✓
· buffers declared (author-side waiting normal) ✓ · corpse on every terminal ✓
· one barcode, minted at the dock ✓.

**AS-BUILT deviations = the build queue** (ordered per IOS wiring priority;
each becomes a Dispatch Pack with the machine-verifiable exit criterion given):

| # | Dispatch | Exit criterion (machine-verifiable) |
|---|---|---|
| D-AS-01 | `approved_by` on chapter approvals (D10) + backfill epoch note | Column exists; approveChapter writes actor; new approvals without actor impossible (constraint); inv_11 sensor reads 0 anonymous-post-epoch approvals |
| D-AS-02 | `as_journeys` table + scan-on-arrival + worker writebacks | Every webhook fire creates a journey row before the call; kill-test files a corpse (reaped) within timeout+60s; polls do zero writes |
| D-AS-03 | Reaper (pg_cron) + journey timeout enforcement | Deliberately stalled journey → reaped terminal + QCO corpse row; zero journeys in non-terminal state older than 2× timeout (inv_12) |
| D-AS-04 | UCO minimum: notifications ledger + instant ack + J1-ready/failed notices | Ack row within 5s of submit; no silent receipt (INV-39 pattern ported as inv_13) |
| D-AS-05 | Phase-exit gates first-class (G-AS-P1..3) with reject surface | Transition with 1 unapproved chapter → rejected with named list, nothing advances; pass → all G-AS-P criteria machine-checked, not code-implied |
| D-AS-06 | Analysis gates (G-AS-A/C) + retry wave | Coverage-count mismatch → auto-retry then failed corpse; green only via gate |
| D-AS-07 | LMO ledger: model/tokens/cost per craft call | Every J1–J3 run has a ledger row; declared-vs-actual model sensor armed |
| D-AS-08 | SPC pilot on Alex (tolerance declarations + control chart from SM feed) | 2 weeks of per-chapter samples charted; drift alarm demonstrably fires on injected shift |

Sequencing: D-AS-01..04 are the September demo-hardening set (reliability +
experience). D-AS-05..07 complete the grammar. D-AS-08 is the method's
showcase. Per the deployment split: 01/03 are DB-side (SysAdmin applies);
02/04/05/06 touch app + n8n (platform chats deploy); 07 is n8n-side.

**Line-build gate status after this pack: IOS ✓ · RDP ✓ · JD ✓ · GR ✓ · SM ✓ —
the Author Studio line is cleared for S5 dispatch.**
