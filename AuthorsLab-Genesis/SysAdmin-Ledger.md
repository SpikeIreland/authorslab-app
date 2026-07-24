# SIS Methodology / AuthorsLab — Project Ledger

## 2026-07-24 — Entry 17: DP-AS-02 E1 ACCEPTED (verified); E2/E3 gated on Paul's n8n work

Platform chat filed DP-AS-02 plan + completion (app side). Spot-verified
before acceptance: 8 startJourney sites (7 studio + 1 transition) covering 11
webhook fires ✓ · zero silent .catch handlers ✓ · lib's only write =
startJourney insert (scan on arrival), poll select-only ✓. **E1 accepted;
dispatch stays OPEN** — E2 (kill-test) and E3 (happy path) await n8n
instrumentation: Paul pushes their branch, instruments alex-chat first (their
§6 has the three UPDATE statements verbatim), runs the §2/§3 protocols.
Offered a temporary audit trigger for E3's zero-write proof. Acceptance filed
to their folder. Their ship-then-instrument degradation design (un-instrumented
workflows reap honestly instead of breaking) noted with approval.

**Paul's queue:** push redesign branch · instrument alex-chat · kill-test ·
tell platform chat DP-AS-04 response is waiting (done via their folder).

## 2026-07-24 — Entry 16: DP-AS-04 schema request ANSWERED, APPLIED, VERIFIED

Platform chat's schema request (AL-PDC-DP04-SR) processed. Key answer: the
`notifications` table EXISTS in the live estate (33 rows, predates repo
migrations — their repo-grep couldn't see it; F-002/F-009 pattern). Ruling:
one ledger, their design applied as DELTA (`d_as_04_notifications_uco`):
journey_id + template_id columns, partial unique (journey_id, template_id),
unread index, their two triggers verbatim (adapted to user_id/message/type
shape), sensor allocated as **inv_13_silent_receipt** and registered — board
now 13 sensors.

**Verified live:** E1 ack row on synthetic J1 (snapshot-visibility gotcha
noted for their tests) · E2 exactly 2 notices after double terminal write
(OLD-guard + ON CONFLICT both proven) · inv_13 = 0 · test rows cleaned.

**Flagged, not fixed:** legacy ALL policy on notifications permits
authenticated self-INSERT (their design wanted trigger/service-role only) —
stands for now (live legacy behaviour risk), queued for a policy-tightening
pass. Response filed to their folder:
`docs/sis/platform-dev/2026-07-24-DP-AS-04-schema-response.md`. DP-AS-04
app-side CLEARED.

## 2026-07-24 — Entry 15: Verification delta ACCEPTED — DP-AS-02 cleared

Platform chat's first act delivered as specified:
`docs/sis/platform-dev/2026-07-24-verification-delta.md` (AL-PDC-VD-001).
Quality: evidence-cited per surface, superseded-framings section, self-
organized subfolders (platform-dev/, ghostwriter/ handover, findings/
convention). **Spot-checked against machinery before acceptance** (standing
rule): as_journeys refs in src = 0 ✓ · cited files exist ✓ · approveChapter
lacks approved_by ✓ · ghostwriter handover filed ✓. Verdict: brief's build-
state claims all still true; deltas are our two migrations + the SIS pack
superseding the brief's pending-framing sections. Zero new findings.

**Rulings back to the platform chat:**
1. Migration naming: converge on the app's existing `YYYYMMDD_snake.sql`;
   future SysAdmin files follow (e.g. `20260724_d_as_02_x.sql`); the two
   July files stay as-is (history not rewritten).
2. n8n-approves-chapters check deferred to DP-AS-06 as proposed; inv_11
   watches meanwhile.
3. Webhook signature changes for journey_id go through Paul; n8n-config
   additions cite IOS tags (per station brief).

**DP-AS-02 CLEARED to proceed.** Note: a second, larger verification-delta
copy sits in docs/sis/ghostwriter/ — Paul to confirm whether the ghostwriter
chat has begun its own re-founding pass.

## 2026-07-24 — Entry 14: Platform chat re-founding kit shipped

Decision (with Paul): **re-found the existing platform chat, don't replace** —
its codebase knowledge is the asset; staleness risk managed by verification-
first opening act (F-004 discipline). Scope fenced: this plant + demo path;
SIS canvas product stays with the methodology chat.

Created `authorslab-app/docs/sis/` — the platform chat's governing-document
set in its own workspace (copies; Methodology-Exchange remains master):
charter, decisions D1–D10, PFD Rev C, IOS, RDP, Wave-1 dispatches, plus
**`0-REFOUNDING-BRIEF.md`** (the genesis document: station ownership, standing
laws, read order, live DB machinery note, verification-first first act,
courier protocol). Paul pastes the brief into the existing chat to re-found it.

Sync rule noted: exchange copies are master; on any revision, re-copy to
docs/sis/ (manual for now — candidate for a sync check later).

## 2026-07-24 — Entry 13: Wave 1 DB-side SHIPPED and verified (connector restored)

Supabase connector re-authenticated by Paul; access confirmed. Both staged
migrations applied in order (`d_as_01_approval_actor`,
`d_as_03_journeys_and_reaper`). **State: pending-apply → SHIPPED.**

**Verification (evidence, not claims):**
- Actor trigger: simulated authenticated approval on a real unapproved
  chapter → approved_by captured AND correct (matched the session author's
  profile id); rolled back. First attempt was green-vacuous (author had no
  unapproved chapters) — re-run against a real candidate.
- Reaper kill-test: synthetic journey with expired timeout → reaped with
  terminal_reason on demand; test row deleted (deliberate act, recorded here).
- Clocks: `as-journeys-reaper` (*/5) + `production-health-daily` (21:00 UTC)
  both scheduled.
- Board: 12 registered sensors, inv_11 + inv_12 live and GREEN (vacuous-armed;
  bite proven by the tests above). Standing ambers unchanged (inv_03: 2,
  inv_06: 3, inv_07: 8 — still awaiting Paul's adjudication).

**D-AS-01 and D-AS-03: CLOSED** per exit criteria. as_journeys machinery live
and waiting for DP-AS-02 (platform chat) to start writing journeys. Ladder
next step (post-frontend): promote actor rule to a CHECK constraint.

## 2026-07-24 — Entry 12: S5 opens — Wave 1 staged (migrations pending-apply, dispatches cut)

**DIVERT:** Supabase MCP still refusing all calls (permission error persists
after refresh) — Paul must re-authenticate the connector. Per split-in-spirit:
D-AS-01 and D-AS-03 authored as **ready-to-apply migration files** in repo
`sql/`: `2026-07-24_D-AS-01_approval_actor.sql` (approved_by columns +
actor-capture trigger + inv_11) and `2026-07-24_D-AS-03_journeys_and_reaper.sql`
(as_journeys with policies + pg_cron reaper + inv_12 + cumulative
health_check v2 registering inv_11/12). Apply IN ORDER; verification steps
embedded in each file. State: **pending-apply** (I apply on connector return,
or Paul pastes to SQL editor). Invariant numbers inv_11–13 formally allocated
(13 reserved: UCO silent-receipt, ships with DP-AS-04).

**Dispatches cut** (`AuthorsLab-Dispatches-AS-Wave1.md`, AL-DSP-001):
Station Brief for the platform developer chat (ownership, laws, context list)
+ DP-AS-02 (journey wiring, kill-test exit criteria) + DP-AS-04 (UCO minimum
on notifications table) + DP-AS-05 (first-class phase gates + reject surface)
+ DP-AS-06 (analysis gates + retry wave). Sequencing 02→04→05→06; Paul is
courier + n8n deployer; evidence-not-claims closure rule stated.

**Note:** session dates — plant work began 2026-07-22; today is 2026-07-24.
Epochs in the new sensors use 07-24.

## 2026-07-22 — Entry 11: S2 complete for Author Studio — RDP V1, line cleared for dispatch

`AuthorsLab-RDP-AuthorStudio-V1.md` (AL-RDP-001) shipped — the four S2
artifacts in one pack. Station census 36 typed stations/elements across 3
phase segments. Five journey types defined with timeouts/terminals around one
new mechanism: `as_journeys` (scan-on-arrival, worker writebacks, reaper —
fixes F-013). Gate register: 12 gates specced with deterministic pass criteria
+ reject paths (G-AS-A/C/D/P families; phase-exit gates promote the
areAllChaptersApproved soft check up the ladder). Subscription map wires all
6 MISSING signal rows from AL-IOS-001 to QCO/UCO/LMO, incl. the Alex SPC
feed. Conveyor register started (5 assets, owners).

**Grammar validation: AS-DESIGNED passes. AS-BUILT deviations → 8 numbered
dispatches (D-AS-01..08), each with machine-verifiable exit criteria.**
D-AS-01..04 = September demo-hardening set. Deployment split respected:
01/03 SysAdmin-side; 02/04/05/06 platform chats; 07 n8n.

**Line-build gate: Author Studio CLEARED (IOS+RDP+JD+GR+SM all ✓).** S5 can
open on this line: station briefs + dispatch packs cut from this pack.

## 2026-07-22 — Entry 10: D10 ratified · Artifact Register V1 (the drawing set)

D10 recorded in the decision record (approvals carry approved_by — every desk).

`SIS-Artifact-Register-V1.md` shipped: the full document register, S0–S7 +
cross-cutting, ~25 artifact types with ID conventions, consumers, and dual
status (reusable template vs AuthorsLab instance). Defines the two build-start
gates: PLANT build (LC+PSS+ISP+SL — AuthorsLab passes, two formalisation
debts: Plant Setup Sheet, Standing Laws checklist) and LINE build (IOS+RDP+
JD+GR+SM per line). Author Studio stands 4 artifacts from first dispatch —
all four = the S2 Route Definition Pack, one working session, consuming
AL-IOS-001. D10/F-013/the 9 unbuilt gates get their specs in GR+JD.

**Next agreed step: S2 — Author Studio Route Definition Pack.**

**Note:** device bridge dropped late entry 9; files delivered in-chat; disk
commits pending reconnect (retry queued: IOS V1, findings register, ledger).

## 2026-07-22 — Entry 9: S1 first artifact — Author Studio I/O Schedule V1

`AuthorsLab-IO-Schedule-AuthorStudio-V1.md` (AL-IOS-001) shipped — the
method's first true tag database, enumerated from live machinery (studio page,
helpers, n8n-config, schema). 23 points: 13 in, 8 material out (6 WIRED),
6 signal out (0 fully wired). Verdict: material layer healthy, signal layer
empty — "the machine runs, but the marshalling cabinet is empty."

**Caught by the schedule (drawings couldn't see these):**
- F-012: approvals are anonymous — phase_N_approved_at records WHEN not WHO.
  Defect under D7/D9. Decision candidate **D10: approvals carry approved_by.**
- F-013: completion-by-polling-inference; killed workflow = spinning UI, no
  corpse. S2 journey definitions must add server-side timeouts + reapers.
- Legacy token-validation webhook still referenced (retire or recommission);
  admin actions unlogged on this line.

**Proposed wiring order:** S05 approval actor → I-11 completion/corpse →
S03 UCO ack → S01/S02 telemetry+gates → S06 SPC pilot. Feeds S2 directly.

**Divert:** Supabase MCP began refusing all calls mid-session after a
reconnect (permission error) — schema pulled from repo type contracts
instead. Paul: connector likely needs re-authentication.

## 2026-07-22 — Entry 8: CHARTER FROZEN. S0 complete; S1 open.

Paul's "freeze it" → **AL-PFD-000 Rev C** cut (D7–D9 drawn in; R1/R3 closed on
the sheet; R2 the sole open-at-freeze item; desktop artifact updated) and
**AuthorsLab-Line-Charter-V1.md** issued. Charter = charter doc + Rev C +
decision record; changes henceforth are numbered decisions → new revisions,
never silent redraws. Verified by screenshot.

**The full S0 loop ran in one day on a real plant:** intake meeting → intake
brief → PFD Rev A (6 flags) → client review 1 (D1–D6) → Rev B → priorities
brief + review 2 (D7–D9) → Rev C + charter freeze. Three template/method
revisions fell out of field use (intake §4a, F-008..F-011). This is the
method's first complete stage executed as designed — book evidence.

**S1 now open — I/O Schedule, first line: Author Studio.** Queued alongside:
the hybrid briefing for the platform developer agent (F-010; brief's "pending
briefing" is ours), and eventually Rev D when R2 resolves.

## 2026-07-22 — Entry 7: Review 2 — Priorities Brief absorbed; D7–D9 ratified

Read `AuthorsLab Platform Priorities Brief.docx` (Jacky Klein demo companion).
Reframes: September demo = Jacky Klein, exec publisher of new Blair-backed
Jewish imprint (= R3's "partner" — resolved as IDENTITY: she's the tier-2
customer, not a distribution channel). Blair–Brontë = downstream tier-3.
Three-tier customer model; defensible position = represented-author +
editorial-team workflow, not indie tooling. Script tab strategically hot
(book-to-screen tailwind). Current-build-state section updates estate picture
again (Companion/Home real, project shell real, tabs part-real, covers MOCK).

**Ratified:** D7 entity ownership model (person OR imprint; members+roles;
tier-3 deferred; migration-cheap rule binding on all new work) · D8 script v1
= treatment + scene breakdown, real generation (closes R1) · D9 sign-off
default = owner holds the approval key per project. Multi-project ruled
already-designed (Lobby = works order board; P5 portfolio = same pattern,
entity level). R2 remains open (candidate: open-at-freeze).

**Findings:** F-010 (parallel build chats — SIS deliverables must name their
consumer chat; the brief's "hybrid briefing pending" is OURS to write) ·
F-011 (intake missed "who owns the plant?" — template Rev 2 adds §4a).

**Queued next:** Rev C (D7–D9 + R3 reframe drawn in) · Line Charter freeze
with R2 open-at-freeze · S1 I/O Schedule on Author Studio · the hybrid
briefing for the platform developer agent (first exchange-protocol test with
the client's own build chats).

## 2026-07-22 — Entry 6: Review loop 1 closed — PFD Rev B cut

Client (Paul) answered Q1–Q6 → decisions D1–D6 recorded in
`testcase-authorslab/AuthorsLab-Client-Decisions.md`; design intent absorbed
from repo `docs/DESIGN_DECISIONS.md` (Design/Publishing split: Taylor/Morgan;
Riley marketing; Companion home dock; free-movement navigation; roster).

**Rev B shipped** (`AuthorsLab-PFD-RevB.html`, desktop artifact updated):
7 lanes; script re-sourced from edited MS (D1); author-in-the-carousel chapter
loops (D6); agency view deleted (D5); partner-channel exploratory chip (D4/R3);
marketing staged (D2); transfer approval desk (D3). Typing: 14 AI / 6 det /
7 human / 10 gates (1 built, 9 grammar-required). Verified by screenshot.

**Residuals for Rev C:** R1 script form · R2 integration scope · R3 partner
channel model (flagged as potentially a second PLANT CUSTOMER — recommend own
intake conversation; possibly SIS engagement #2).

**Findings:** F-008 (route-enforcement spectrum: enforced-sequence vs free-roam
plants — V0.2 vocabulary candidate) · F-009 (intake must pair estate survey
with design-intent survey) logged in the register.

**Next:** charter freeze needs R1–R3 dispositions (or explicit "open at
freeze" markers) → then S1 I/O Schedule, first line = Author Studio (demo
path). The chapter-approval loop (D6) is also the natural first SPC worked
example: Alex's per-chapter output already has a human accept/reject signal —
a ready-made control-chart data source.

## 2026-07-22 — Entry 5: S0 played live — the AuthorsLab intake test case

Process decision ratified by play-through: **the first internal act after a
client meeting is the drawing, not a questionnaire.** The intake brief is SIS's
listening guide; the elicitation instrument is PFD Rev A with open questions
flagged on it. Loop: meeting → intake brief → PFD Rev A → client corrections →
Line Charter freeze → S1.

Shipped to `Clarence/Methodology-Exchange/testcase-authorslab/`:
- `SIS-Intake-Template.md` — reusable S0 listening guide (8 sections + exit).
- `AuthorsLab-Intake-Brief.md` — filled from the client statement; 6 finished
  goods, 6 open questions (Q1 script source · Q2 marketing reach · Q3 handoff
  approval · Q4 publishing targets · Q5 agency persona · Q6 sign-off points).
- `AuthorsLab-PFD-RevA.html` — the drawing (also persisted as desktop artifact
  `authorslab-pfd-rev-a`): 6 lanes (ghostwriter, script[dashed], intake,
  editing, publishing, marketing[dashed]) + offices strip; first-pass typing
  9 AI / 5 det / 6 human / 8 gates (5 grammar-required, unbuilt — marked *);
  solid=exists, dashed=proposed; verified by screenshot.

**Next in the play-through:** Paul answers Q1–Q6 as the client → Rev B →
charter freeze → S1 I/O Schedule for one line (candidate: editing line, since
it's demo-critical for September).

## 2026-07-22 — Entry 4: RE-SCOPE. This chat is now the SIS Methodology chat.

Paul's ruling: this chat's mission is articulating the stochastic-industrial
(hybrid) methodology for Spike Island Studios — the discipline, the process,
eventually the platform (an n8n-class builder for non-programmers). AuthorsLab
becomes the proving ground; a dedicated AuthorsLab chat will be founded later
via handover doc from here. This chat holds a foot in both camps until then.

**Operating model agreed:** two tracks. Track A = AuthorsLab demo-readiness
(Blair Partnership demo, September — ghostwriter + script adaptation on the
demo path; scope frozen; commissioning sheets for the demo itself). Track B =
SIS method (this chat's main work). Coupling = the findings register:
everything Track A teaches is logged same-day and triaged into the method.

**Shipped this entry (all in `Clarence/Methodology-Exchange/`):**
- `README.md` — the SIS ⇄ Clarence bridge protocol (inbox/outbox, Paul as
  courier, standing requests to Clarence SysAdmin).
- `SIS-Process-V0.1.md` — the process decomposition: 7 stages (Objective →
  I/O Schedule → Route Design → Governance Wiring → Provisioning → Station
  Build → Commissioning → Operate/SPC), reconciled against Method V1 phases
  and Paul's 5-stage PLC framing. New vs corpus: I/O Schedule as founding
  artifact, material/signal layer split, offices as design stage, day-zero
  provisioning stage, point-to-point commissioning, SPC for Craft stations,
  hybrid principle as law. §4 = the open-questions list to work through.
- `SIS-Findings-Register.md` — seeded with F-001..F-007 from this week's
  AuthorsLab work.

**Corpus read into this chat:** The-Industrial-Platform-Method-V1 (doctrine
P1–P12, phases 0–6), Clarence-Live-Design-V2 (gate grammar, Appendix A
taxonomy + palette, Appendix C offices UCO/SO/LMO, A4 strategic note — the
platform embryo), Industrial-Philosophy one-pager (staged, unread), Clarence-
Production-Control-Design-V1 (staged, unread).

**AuthorsLab operational state (carried, unchanged):** sensor board 0 RED /
2 AMBER / 2 WATCH; ambers await Paul's adjudication; storage-bucket exposure
open; live n8n estate survey pending Paul's account cleanup + connector
repoint. All transfers to the future AuthorsLab chat via handover doc.

---


One register file, per operating rule §5. Newest entries at top within each section.
States: SHIPPED (live in production) · pending-push (in repo, awaiting Paul) · open.

---

## 2026-07-22 — Founding session (entry 3): production control MVP (day-zero item #3)

### SHIPPED: `production_control` schema — sensors, health_check(), historian, daily clock

Migrations `production_control_mvp` + `fix_initialize_editing_phases_started_at`
applied live. Commissioning epoch for all sensors: **2026-07-22**.

**Invariant register** (numbers allocated by SysAdmin; a view isn't a sensor
until it's in health_check() — all 10 below are registered):

| # | Sensor | Sev | First reading | Notes |
|---|---|---|---|---|
| inv_01 | rls_disabled_public (meta) | RED | 0 GREEN | Retro-arm proof: reads 10 against yesterday's state — would have caught the founding condition |
| inv_02 | rls_no_policies | WATCH | 1 | workflow_executions, deliberately on display pending commission-or-drop |
| inv_03 | multi_active_phase | AMBER | 2 | 2 manuscripts with >1 active phase — needs Paul: legal parallelism or defect? |
| inv_04 | phase_timestamp_sanity | RED | **5 → 0 same day** | First class caught AND closed: see below |
| inv_05 | phase_number_drift (derive-don't-duplicate) | AMBER | 0 GREEN-clean (8 manuscripts scanned) | |
| inv_06 | stalled_analyzing | AMBER | 3 | 3 manuscripts 'analyzing' >7 days (transient state held) — triage with Paul |
| inv_07 | stalled_ghostwriter | WATCH | 8 | All 8 sessions active-but-idle since March — product decision: dormant ≠ active |
| inv_08 | orphan_text_analyses | AMBER | 0 GREEN-VACUOUS | Tables empty; armed, not proven |
| inv_09 | orphan_manuscript_children | AMBER | 0 GREEN-VACUOUS | Same |
| inv_10 | workflow_executions_rows | WATCH | 0 | Any row = unknown machinery alive; retire when table commissioned/dropped |

**First class closed (same day as sensor commissioning):** inv_04 caught 5
developmental phases 'active' with no started_at. Root cause:
`initialize_editing_phases` trigger created phase 1 active without stamping
started_at. Fix: function patched (also pinned search_path — one WARN off the
advisor list), 5 rows backfilled (started_at := created_at), inv_04 re-read 0.
Class closed per convention: the rule that would have caught it exists and
reads green.

**Historian:** `health_history` live; two snapshots on day zero (pre-fix
baseline showing the RED, post-fix showing closure — the chart starts with a
story). pg_cron installed; job `production-health-daily` at 21:00 UTC
(05:00 Perth). Access: production_control revoked from anon/authenticated.

**Facts for next session:** editing_phases = 5 phases/manuscript
(developmental→line_editing→copy_editing→publishing→marketing, editors
Alex/Sam/Jordan/Taylor/Quinn — note Quinn exists in trigger + manuscripts
report columns but has no workflows in the estate survey yet). FKs cover
chapters/chat/sections (orphans impossible); persona conversation tables and
text-keyed analysis tables have NO FKs (sensors watch instead).

**Paul (in flight):** old-account cleanup + MCP access enabled on relevant
workflows — live-estate survey unblocked next session.

## 2026-07-22 — Founding session (entry 2): n8n estate separation

### DONE: survey + classification. DIVERTED: tagging (MCP write disabled) → manifest for Paul.

**The genesis recon was stale.** The live AuthorsLab n8n estate migrated to a
separate account — `authorslab.app.n8n.cloud` — on 2026-04-23 (source:
`src/lib/n8n-config.ts` header, corroborated by execution ground truth: zero
executions in spikeislandstudios since ≥22 May 2026 bar one erroring relic).
spikeislandstudios is entirely a museum: Legal project = old Clarence (130),
Writing = old AuthorsLab (53: 32 still ACTIVE with live webhooks — hazard),
personal = sandbox (10, incl. 2 misplaced Clarence items), Video Creation = empty.

- **Deliverables:** `n8n-Estate-Manifest.md` (full classification + tag plan +
  deactivation candidates) and `Courier-Brief-Clarence-Erroring-Relic.md`
  (Get Session Providers, hit 30 Jun–3 Jul, all errors — stale caller somewhere
  in Clarence's estate).
- **Corpse:** MCP tagging attempt failed — every workflow has availableInMCP:
  false in the old account. Divert recorded; Paul applies tags in UI.
- **Agreed with Paul:** repoint n8n MCP connector at the authorslab account;
  live-estate survey + Route Definition Packs follow once observable.
- **Frontend/hosting facts established:** Vercel team `paul-lyons-projects`,
  project `authorslab-app` (authorslab.ai, www, ghostwriter.authorslab.ai).
  Latest deployment READY 2026-05-04. Note `live: false` and target: null on
  latest deployment — check what production alias actually serves during next
  session. n8n-config.ts self-flags 3 mismatches to verify in live account
  (free-manuscript-analysis inactive?, ghostwriter-gap-analysis path,
  06.01 not wired).

## 2026-07-22 — Founding session (entry 1)

### SHIPPED: RLS remediation, the 10 exposed tables (day-zero item #1)

Migration `rls_remediation_ten_exposed_tables` applied directly to Supabase
project `itlkncjiifbgvmvuejgm` per the deployment split. All 10 tables from the
genesis recon now have RLS enabled with scoped policies (not blind enables):

| Table | Policies granted (TO authenticated) | Rationale |
|---|---|---|
| user_sessions | RLS enabled; pre-existing "view own" SELECT policy now actually enforced (was written but RLS never enabled — pure theatre) | Writes are service-role only |
| word_count_history | SELECT own+admin | Pipeline-written history; client read-only |
| developmental_analyses | SELECT own+admin (manuscript_id is TEXT — cast join `m.id::text`) | Pipeline-written; empty |
| analysis_findings | SELECT own+admin (TEXT manuscript_id, cast join) | Pipeline-written; empty |
| chapter_versions | SELECT own+admin; INSERT own | Versions immutable — no update/delete |
| alex_conversations | SELECT own+admin; INSERT own | Chat append-only |
| jordan_conversations | SELECT own+admin; INSERT own | Chat append-only |
| sam_conversations | SELECT own+admin; INSERT own | Chat append-only |
| alex_initial_analyses | SELECT own+admin | Pipeline-written |
| publishing_progress | Full CRUD own; admin read/update | Only table the app actively touches (10 src files, 3 live rows) |

Policy idiom matches house style: `manuscript_id → manuscripts.author_id →
author_profiles.auth_user_id = auth.uid()`, with `is_admin()` OR-branch on reads.

**Verification (earned, not attested):**
- Security advisors: 13 ERROR-level findings before → **0 after**.
- Negative test: `SET ROLE anon` sees 0 rows in publishing_progress (3 exist).
- Positive test: simulated JWT for a real author (`sub=3bb7…3ec0`) sees exactly
  their 1 publishing_progress row and 1 manuscript — isolation proven against
  live data, not vacuously.

**Facts established during recon:**
- App auth is fully Supabase SSR (cookie-carrying server client, anon key only —
  no service-role key anywhere in the frontend env). API routes run as the
  authenticated user, so RLS applies to them. n8n presumably holds service role.
- 9 of the 10 tables were EMPTY; only publishing_progress had rows. The exposure
  was real but the blast radius of remediation was small.
- No user-fired triggers write into any of the 10 tables (publishing_progress
  triggers are updated_at touches only).

### Open items discovered (register, in rough priority order)

1. **Storage bucket `manuscripts` is PUBLIC with an anonymous-read listing
   policy** ("Allow anonymous reads from manuscripts"). If manuscript files live
   there, this is the same disease as the tables — arguably worse. Needs a
   survey of what's in the bucket and an ownership-scoped policy rewrite.
   Advisors also flag public listing on `author-profiles` and
   `manuscript-covers` (those two may be intentionally public).
2. **`workflow_executions`**: RLS enabled, no policies (locked shut), 0 rows —
   genesis verdict stands: commission properly or drop.
3. **15 functions with mutable search_path** (WARN) — batch fix with
   `SET search_path = ''` when convenient.
4. **`handle_new_user()` and `is_admin()` are SECURITY DEFINER and callable by
   anon via RPC** (WARN) — verify intent; likely revoke anon EXECUTE on
   handle_new_user.
5. **Auth config**: OTP expiry > 1h; leaked-password protection disabled;
   Postgres has pending security patches.
6. **Dead machinery noted**: `create_word_count_history_entry` function exists
   but is attached to no trigger.

### Day-zero build order status

1. RLS remediation — **DONE (this entry)**
2. n8n estate separation — open
3. Production control minimum viable (`production_control` schema, sensors,
   health_check(), historian) — open. Candidate first sensor: RLS-enabled-
   everywhere meta-sensor (would have caught today's condition; retro-arm proof
   available by construction).
4. Route Definition Packs — open
5. Migrate-vs-rebuild adjudication — open
6. Feedback loop (UCO pattern) — open
7. Book line as first commissioned route — open
