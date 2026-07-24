# I/O Schedule — Author Studio Line · V1

**S1 artifact · AL-IOS-001 · 2026-07-22** · Spike Island Studios
**Enumerated from live machinery** (not memory): `author-studio/page.tsx`
(3,706 lines), `phase-transition/page.tsx`, `lib/supabase/helpers.ts`,
`n8n-config.ts`, live schema. The tag database for the demo-critical line.

**Status legend:** WIRED = exists and carries signal today · PARTIAL = exists
with a known deficiency · MISSING = required by the design grammar or charter,
not built. A MISSING row is a work item, not a footnote.

---

## Inputs

| Tag | Class | Point | From → To | Data class | Contract | Loop check | Status |
|---|---|---|---|---|---|---|---|
| AS-I-01 | Inter-line transfer | Manuscript enters the line | Intake store / Ghostwriter (D3 desk) → editing_phases init | Manuscript (customer IP) | Parsed chapters exist; 5 phases created, phase 1 active+started | Create test project → 5 phase rows, phase 1 active with started_at | WIRED (fixed 2026-07-22) |
| AS-I-02 | User action | Studio session open | Author browser → Supabase auth (+ legacy token-validation webhook) | Session identity | Authenticated member of the project's entity sees only their plant | Sign in as test author → own manuscripts only (RLS proven 2026-07-22) | PARTIAL — legacy token webhook still referenced; retire or re-commission |
| AS-I-03 | User action | Editor/phase selection (free movement, F-008) | Author → UI state + editing_phases read | — | Any tab reachable; recommended next highlighted | Switch editors mid-phase → no state corruption | WIRED |
| AS-I-04 | User action | Request full-manuscript analysis | Author → n8n `{alex,sam,jordan}-full-manuscript-analysis` | Manuscript → AI provider | Async: returns immediately, progress via polled state | Fire on test ms → analysis rows land; UI completes | WIRED (see AS-I-11 deficiency) |
| AS-I-05 | User action | Request chapter analysis | Author → n8n `{alex,sam,jordan}-chapter-analysis` | Chapter → AI provider | Async per chapter; issues filed to manuscript_issues | Fire on one chapter → issues appear, severity-ordered | WIRED |
| AS-I-06 | User action | Chat message to editor persona | Author → n8n `{alex,sam,jordan}-chat` → editor_chat_messages | Conversation (personal) | Reply persisted to thread; context = project | Send message → row in editor_chat_messages + reply renders | WIRED |
| AS-I-07 | Material intake | Author edits chapter text | Author → chapters.content (autosave) | Manuscript (customer IP) | Keystroke-level work is never lost; autosave confirmed | Edit → reload → text persists; version safety at approval | WIRED |
| AS-I-08 | User action | **Approve chapter (per phase)** | Author → chapters.phase_N_approved_at + content commit | Approval + manuscript | The D6 loop's deterministic exit; commits content with the approval | Approve ch.1 phase 1 → timestamp set, content committed, counts move | **PARTIAL — records WHEN, not WHO** (see AS-O-S05; D7/D9 defect) |
| AS-I-09 | User action | Resolve / dismiss issue | Author → manuscript_issues.status | Editorial record | flagged → dismissed/resolved; display re-orders | Dismiss issue → status change persists, list updates | WIRED |
| AS-I-10 | User action | Phase transition | Author → phase-transition page → editing_phases + manuscripts + `generate-manuscript-version` | State + version snapshot | All-approved check → snapshot (manuscript_versions) → next phase active | Complete phase on test ms → snapshot row + phase 2 active + phase 1 complete w/ completed_at | WIRED (gate is soft — see AS-O-S02) |
| AS-I-11 | External signal | Work-complete signal from n8n | n8n → (nothing) — app **polls DB state** and infers | — | NONE. Completion inferred client-side; timeout client-side only | Kill a workflow mid-run → today: UI spins/times out silently; nothing files a corpse | **MISSING — no corpse on the abandoned path** (P4 law violated) |
| AS-I-12 | Timer | Scheduled inputs (stall clocks, golden batch) | — | — | None on the line; QCO inv_06 (7-day stall) is the only watcher | n/a | MISSING — journey timeouts unset (S2 work) |
| AS-I-13 | Manual override | Admin access | Admin → RLS is_admin() OR-branches | All rows | Admin sees/updates any; actions unlogged | Admin edit → succeeds; NO audit trail today | PARTIAL — no admin_actions logging on this line |

## Outputs — material layer

| Tag | Point | To | Contract | Status |
|---|---|---|---|---|
| AS-O-M01 | Chapter content (autosaved, living text) | chapters.content | Latest author-approved-or-working text | WIRED |
| AS-O-M02 | Chapter approval states | chapters.phase_N_approved_at | Deterministic D6-loop exits, per phase | WIRED (actor gap → S05) |
| AS-O-M03 | Analysis artifacts | manuscripts.full_analysis_*, sam/jordan_initial_thoughts, chapter summaries | Craft-station output, persisted | WIRED |
| AS-O-M04 | Manuscript issues | manuscript_issues (789 live rows) | Severity-typed findings; author disposition recorded | WIRED |
| AS-O-M05 | Editor chat threads | editor_chat_messages | Conversation of record per project | WIRED |
| AS-O-M06 | Phase snapshot | manuscript_versions (approved_snapshot) | Immutable collated ms per completed phase, word-counted | WIRED |
| AS-O-M07 | Phase/line state | editing_phases.phase_status + manuscripts.current_phase_number | Single source: editing_phases; drift watched by inv_05 | WIRED |
| AS-O-M08 | Editor report PDFs | manuscripts.{alex,sam,jordan}_report_pdf_url | Phase report deliverable | PARTIAL — columns exist; generation path unverified |

## Outputs — signal layer (the unwired panel)

| Tag | Point | To | What's needed | Status |
|---|---|---|---|---|
| AS-O-S01 | Station telemetry: arrive/complete/fail + model + tokens per craft call | QCO + LMO | Emit per call (n8n-side or app-side ledger); replaces dead workflow_executions | **MISSING** |
| AS-O-S02 | Gate events: phase-exit pass/reject | QCO | The 3 grammar-required phase gates, built (all-approved is checked in code but is a soft check, not a first-class gate with reject path) | **MISSING** |
| AS-O-S03 | UCO notices: long analysis started/finished; large-ms buffer notices | UCO → author | "Email me when done" — instant deterministic ack + state-driven completion | **MISSING** (UCO not commissioned on this plant) |
| AS-O-S04 | QCO state sensors | production_control | inv_03–inv_06 live (epoch 2026-07-22) | PARTIAL — state-level only, no event sensors |
| AS-O-S05 | Approval audit: WHO approved | approvals carry actor | `approved_by` (member id) beside each phase_N_approved_at; required by D7/D9 before any second member exists | **MISSING — decision candidate D10** |
| AS-O-S06 | SPC feed: per-chapter accept/regenerate/edit-distance per craft station | QCO control charts | Derivable partly from existing timestamps; formalise as the first SPC worked example | MISSING (planned — the demo-path SPC pilot) |

---

## Reading of the board

23 points: 13 inputs, 8 material outputs (6 WIRED), 6 signal outputs (**0 fully
wired**). The material layer of this line is in honestly good shape — the
plant does its work and keeps its records. The signal layer is where the
methodology has its work: nothing on this line tells the supervisory layer
anything as an *event*; every green is inferred by polling, no failure files
a corpse, and approvals are anonymous. In PLC terms: the machine runs, but
the marshalling cabinet is empty.

**Priority wiring order (proposal):** S05 (approval actor — cheap, blocks
multi-member) → I-11 (completion signals + corpse path — demo reliability)
→ S03 (UCO ack on long analyses — demo experience) → S01/S02 (telemetry +
real gates) → S06 (SPC pilot).

**Feeds S2:** journey definitions (route × step × timeout) formalise AS-I-11/
I-12; the three phase gates get pass criteria + reject paths from AS-O-S02.
