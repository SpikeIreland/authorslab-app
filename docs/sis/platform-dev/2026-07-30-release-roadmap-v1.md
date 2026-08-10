# Release roadmap v1 — post-MVP-strategy

**AL-PDC-ROADMAP-001 · 2026-07-30**
**From:** Platform Developer station
**Status:** Working draft. Evolves as other chats produce work and market signal arrives.

Following Paul's founding strategic decision today (2026-07-30) to ship editing-studio as MVP and stagger the rest as timed releases, here's how Platform Dev proposes we move forward. Reflects everything currently in flight across the seven active stations.

## 1 · The two-track framing (this is the biggest thing to internalise)

We're running two parallel tracks. Neither blocks the other. Both need to be true by September.

### Track A · Public MVP

- Audience: paying individual authors (fiction, self-publishing-oriented)
- Product: editing studio only — Alex, Sam, Jordan
- Ships: as soon as launch checklist is clear (target mid-August)
- Owns the outcome: Marketing chat drives acquisition, Financial Model owns pricing, UI/UX owns the public pages, Platform Dev integrates
- Success metric: real users, real revenue, real signal — even if small numbers

### Track B · Jacky-demo (September)

- Audience: Jacky Klein + potential investor conversations
- Product: full-vision walkthrough on Carl's Spike Island account
- Shows: editing studio LIVE + publisher-collaboration invite flow WORKING + publisher dashboard REAL (data may be mocked, boundary must be real) + cover composer LIVE
- Ships: September (demo date)
- Owns the outcome: Demo & Content Ops chat coordinates; each station contributes
- Success metric: Jacky signs (or at least engages seriously with next steps), investor pipeline warms

**Key insight:** the Jacky demo doesn't require public launch of everything. It only requires Carl's demo account to *show* the full journey. Public releases can lag the demo by weeks or months without hurting the demo.

## 2 · Release cadence — proposed sequence

Dates are targets, not commitments. Reality will shift them.

| # | Release | Target | Contents | Owner chats |
|---|---|---|---|---|
| **R1** | **Editing Studio MVP** | Mid-August 2026 | Alex/Sam/Jordan public; other tabs feature-flagged; public pages complete; legal live; pricing live; billing live | Platform Dev + UI/UX + Marketing + Financial Model + Clarence |
| **R2** | **Publisher-collaboration + Cover Composer (Design tab)** | September 2026 (in time for Jacky demo) | Cover composer UI live; publisher role + invite flow live; publisher dashboard MVP; Design tab publicly available | Taylor D&P + Platform Dev + Demo & Content Ops |
| **R3** | **Ghostwriter station + Riley** | October 2026 | Riley icon persistent in header; Ghostwriter intake for new books; activity-log foundation | Ghostwriter chat + Platform Dev + UI/UX |
| **R4** | **Publishing tab** | November 2026 | Metadata, platform setup (KDP, IngramSpark), launch checklist; publisher-shared | Taylor D&P + Platform Dev |
| **R5** | **Marketing tab (Kai)** | December 2026 | Kai chat, positioning tools, launch plan; publisher-shared | Platform Dev + Marketing (for the tool itself) + UI/UX |

**Why this order:**
- R2 before R3 because the Jacky demo needs the publisher story more than it needs Ghostwriter. Ghostwriter is beautiful and important but Jacky's a publisher — she cares about what happens *to* the manuscript, not what got it started.
- R3 before R4-R5 because Ghostwriter/Riley is the most emotionally resonant feature — it's the differentiator that carries the "companion who understands you" positioning. Worth landing early once the demo is done.
- R4-R5 order is flexible — Publishing feels more urgent because it's the "before Marketing" step in the natural author flow.

## 3 · Immediate Platform Dev next moves (this week)

Platform Dev can execute these without waiting on other chats:

1. **MVP unplug** — feature-flag or hide Ghostwriter/Design/Publishing/Marketing tabs in the project shell; adjust Overview stepper to show only stages 1-3 as active journey (4-5 "coming soon"); simplify new-book fork to upload-only. Half-day. Small commit.
2. **MVP launch checklist doc** — everything that must be true before pointing strangers at authorslab.ai. Includes: onboarding flow smoke test, billing end-to-end test, error handling audit, support process, legal pages live, analytics wired, ad landing pages configured. Half-day.
3. **Publisher-collaboration schema request to TDP** — TDP asked for `project_collaborators` schema as their next architectural piece. Platform Dev responds with the same shape as TDP-DT-01: SQL migration, RLS policies, helper function updates.
4. **Instrumentation for Marketing** — utm parameter capture, event tracking on signup/CTA clicks, cost/attribution data pipes for the acquisition-machine narrative. Half-day once Marketing surfaces what they want measured.

## 4 · Dependencies — what Platform Dev needs from other chats

Ordered by urgency for R1 (MVP launch).

| From | For | What |
|---|---|---|
| **Financial Model** | R1 | MVP tier definitions + monthly prices → gate features in code via feature flags |
| **UI/UX Design** | R1 | Copy for `/pricing`, `/faq`, `/free-analysis` (currently deferred pending inputs); landing-page adjustments for editing-only MVP framing |
| **Clarence Legal placeholders** | R1 | Paul's answers to the 11 blocking items → fills placeholders → legal pages ship |
| **Marketing** | R1 | Elevator pitch and landing-page copy direction so UI/UX can execute |
| **Demo & Content Ops** | R2 | Carl's Spike Island account seeding schedule (needs manuscripts uploaded, demo state configured) |
| **TDP** | R2 | Composer UI complete + `project_collaborators` architecture spec |
| **Ghostwriter** | R3 | Riley/Kai code rename + activity-log architecture spec |

Nothing on this list requires immediate action from me — I execute when input lands.

## 5 · Coordination cadence — proposed

To prevent chat fragmentation and duplicate work:

- **Platform Dev is the integration point.** Every release ship needs Platform Dev in the loop for code, migrations, deployment.
- **Weekly synchronisation (via Paul as courier or a lightweight status doc):** each chat posts a short status update — what shipped, what's next, what's blocked. Reading time under 5 minutes for the whole set. Prevents surprises.
- **Cross-chat requests use the memo pattern** — TDP-DT-01 style: originating station files a request, Platform Dev responds with acceptance + plan. Every recent example has followed this well; keep it.
- **Founding decisions get captured as docs**, not left in chat threads. Every architectural or product decision that affects multiple stations should end up as a dated doc under `docs/sis/`.

## 6 · Milestone checkpoints

| Checkpoint | Target | What "true" looks like |
|---|---|---|
| **MVP launch ready** | Mid-August | R1 checklist all green; can safely point strangers at the URL |
| **First trial ad live** | Mid-August (alongside MVP launch) | Marketing has run first $50-100 test; data starts flowing |
| **Publisher demo path complete** | Late August (before Jacky demo) | Carl's Spike Island account fully seeded; publisher invite flow tested end-to-end; dashboard reads real data |
| **Jacky demo** | September | Rehearsed; storyline holds together; investor-question pack ready |
| **R2 public** | September (post-demo, or aligned with it) | Cover composer + publisher-collaboration live for everyone |
| **R3 public** | October | Ghostwriter station + Riley live |
| **R4 public** | November | Publishing tab live |
| **R5 public** | December | Marketing tab live |

## 7 · Standing risks / open questions

- **MVP launch pushed by legal delays** — the 11 placeholder items Clarence needs answered are the closest thing to a blocker. Suggest Paul prioritise those answers this week.
- **Financial Model unfamiliarity with real cost data** — the LMO ledger has been accumulating for less than 24 hours. Pricing decisions may need to be provisional at MVP and calibrated post-launch when real usage lands.
- **Jacky demo path complexity** — a live publisher-invite flow with a real publisher dashboard on Carl's account isn't trivial. Realistically 2-3 weeks of Platform Dev + TDP work, needs to fit alongside R1.
- **Marketing signal delay** — first ad results won't come back for days after launch. Meaningful acquisition data (CAC by channel, activation rate) takes weeks. Financial Model's investor-facing story will be provisional at Jacky demo.
- **Riley cost per active user** — R3 introduces ongoing per-user LLM cost. Pricing model needs to accommodate before R3 ships.

## 8 · What Platform Dev proposes doing next in this chat

Assuming greenlight, in order:

1. **Draft the MVP launch checklist doc** (§3 item 2 above) — comprehensive, actionable, gets us to "ready to ship" clarity
2. **Execute the MVP unplug** — the technical feature-flag pass (§3 item 1) — small commit, quick test, ships to production once verified
3. **Wait for input on the four dependencies** in §4 that are R1-blocking and integrate them as they arrive

Everything else is other chats' work. This chat's job for R1 is: unplug, checklist, integrate.

— Platform Developer station
