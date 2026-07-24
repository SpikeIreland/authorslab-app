# AuthorsLab — Client Decision Record

The paper trail behind each PFD revision. A decision is recorded once, dated,
and never silently changed — a reversal is a new decision referencing the old.

## Review 1 · 2026-07-22 · produced Rev B

| # | Decision | Drawing effect |
|---|---|---|
| D1 | Script sources from the **edited manuscript** — after editing, before publishing. From-scratch scripts deferred. | Script lane re-sourced; dock ambiguity (Q1) closed; residual R1 = output form |
| D2 | Marketing = generation + full plan + **implementation via integrations**, staged; integrations wait on market research (pre-demo). | Marketing lane keeps generate→approve chain; "integrations · stage 2" chip added; residual R2 = scope/timing |
| D3 | Author **approves** the ghostwriter → editing transfer. | Inspection desk at the boundary confirmed (machinery unbuilt — dashed) |
| D4 | Publishing targets likely broaden; partner conversation live (London, "Jewish Brand" — wants to become a publisher for its writer network). | "partner channel?" exploratory chip; residual R3 — flagged as potentially a NEW CUSTOMER of the plant, not a feature |
| D5 | **No agency persona.** Personal and private is a design law. | Agency view deleted from offices strip |
| D6 | Chapter approval is a **loop inside each editing phase** — author approves per chapter, per stage. | Author desks moved inside the three carousels; phase-exit gates remain (grammar-required, unbuilt) |

Also incorporated from `docs/DESIGN_DECISIONS.md` (client's current design intent,
locked May 2026): Publishing hub splits into Design (Taylor, teal) + Publishing
(Morgan, amber); Marketing = Riley (coral); Home/Companion pre-project dock with
"make this a project" promotion; project-first navigation, recommended sequence
with free movement; Research + Script as always-available tools; roster names
largely placeholders.

## Review 2 · 2026-07-22 · triggered by the Platform Priorities Brief

Source: `AuthorsLab Platform Priorities Brief.docx` (Jacky Klein demo
companion) + client questions on multi-project and multi-author.

| # | Decision | Effect |
|---|---|---|
| D7 | **Entity ownership model ratified.** An account may be a person OR an imprint; projects belong to the entity; members hold roles (owner, co-author, editor, designer). Tier-3 agency surveillance stays off the table (D5 refined, not reversed). NO refactor before September — but every new table, API, and user-facing string keeps the migration cheap (per the brief's rules). | Multi-author = membership + roles, not a dedicated workspace. Charter gains a second persona: publishing-entity member. Intake template gains "who owns the plant?" |
| D8 | **Script line v1 = treatment + scene breakdown** from the edited manuscript, real generation (rough is acceptable); industry screenplay formatting is a later station. Closes R1 per the brief's P3 rationale (Blair–Brontë downstream). | Format gate pass criteria: treatment structure + scene list completeness, not screenplay format |
| D9 | **Sign-off default: owner decides.** One member holds the approval key per project (default: creator); others contribute and comment. Per-desk overrides possible later if needed. | Every Inspection Desk carries an approval-authority property; D6 loops unambiguous under co-authorship |
| — | **R3 resolved as identity, not scope:** the "partner" is Jacky Klein's imprint — the September demo customer (tier 2). Blair–Brontë ecosystem is the downstream tier-3 audience, roadmap only. The partner is who the demo is FOR, not a distribution chip. | Partner-channel chip reframed; demo strategy owns this thread |

## Review 3 · 2026-07-22 · from the Author Studio I/O Schedule

| # | Decision | Effect |
|---|---|---|
| D10 | **Approvals carry the actor.** Every inspection-desk sign-off records WHO (member id, `approved_by`) alongside WHEN. Applies to chapter approvals, transfer approvals, cover selection, campaign approval — every desk. (From finding F-012: `phase_N_approved_at` is currently anonymous.) | First wiring item on the AS line; inspection-desk contract updated in the method; prerequisite for any second member on a project (D7) |

**Multi-project ruling (no decision needed — already designed):** the Lobby is
the works order board; projects are workpieces with route cards. The entity-
level board (brief's P5 portfolio view) is the same pattern one level up —
optional for September, strong positioning if built.

**Still open:** R2 (marketing integration scope/timing — staged per D2, revisit
after market research). May be marked open-at-freeze.

## Superseded — original Open for Review 2 list (→ Rev C)

- **R1** Script output form (screenplay / stage / treatment; format standard) —
  sets the format gate's pass criteria.
- **R2** Integration scope & timing for marketing stage 2; whether stage-1
  "performance" needs read-side platform connections.
- **R3** Partner channel model — white-label plant, reseller door, or second
  finished good? Recommend a dedicated intake conversation with the partner:
  this is potentially a second customer of the plant, and possibly SIS's second
  client engagement rather than an AuthorsLab feature.
