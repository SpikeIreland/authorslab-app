# Build brief — The Manuscript Room

**AL-UX-004 · 2026-07-28**
**From:** UI/UX Design station (via Paul as courier)
**To:** Platform Dev station
**Decision owner:** Paul — direction approved 2026-07-28
**Mockups:** `docs/sis/design/2026-07-28-AL-UX-003-manuscript-room.html` (build target — open it, use the two view buttons) and `…AL-UX-002-dashboard-directions.html` (the direction exploration, for context)

---

## 0 · The decision

Paul has chosen the **Manuscript Room** direction for the AuthorsLab redesign. The
warm palette already used on the Ghostwriter/Eden surfaces becomes the app-wide
visual identity; the chrome adopts the SIS grammar (shared header anatomy + slim
left rail); the Lobby becomes **The Library** (books as objects); and a new
**project dashboard (Overview tab)** becomes the landing surface inside a project.

**Author Studio's interior is untouched.** This brief wraps chrome around it; it
does not reach inside. (Standing boundary from AL-UX-HANDOVER-001 §4.)

---

## 1 · Design tokens

### Palette (source: existing Ghostwriter/Eden surfaces + Design tab concepts)

| Token | Hex | Use |
|---|---|---|
| `ivory` | `#FAF8F4` | App background |
| `paper` | `#FFFFFF` | Cards |
| `paper-warm` | `#FDFBF7` | Card gradient foot / hover |
| `charcoal` | `#2C2C2A` | Header, rail, display ink, book cover |
| `ink` | `#2C2C2C` | Body text |
| `muted` | `#8A857C` | Secondary text (warm grey — not slate) |
| `faint` | `#B5AFA4` | Tertiary text / disabled |
| `line` | `#E8E2D8` | Borders (warm — not slate) |
| `line-soft` | `#F0EBE2` | Hairlines inside cards |
| `sage` | `#8FAF8A` | Active/live state, Eden, Alex |
| `sage-deep` | `#5C7A6B` | Complete state, primary buttons, Jordan, Reid |
| `sage-bg` | `#EFF4EE` | Active halo / complete chip bg |
| `terracotta` | `#D4956A` | Sam, Ivy, notification dot, attention accents |
| `amber-bg` | `#FDF6EE` | Warm chip bg |

Persona colour map (already established in code): Eden + Alex `sage`, Sam + Ivy
`terracotta`, Jordan + Reid `sage-deep`. Taylor/Riley: pick from the same family
when their surfaces are styled (mockup uses `faint` and a clay `#A98A6B`).

### Typography

- **Display (headings, book titles, wordmark):** system serif stack —
  `'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif`. No webfont
  needed for phase 1; if we later want a licensed face, that's a swap in one token.
- **UI (everything else):** the existing system sans stack.
- Kickers/labels: 11px, uppercase, letter-spacing ~0.14em, `muted`.

### Stage-state grammar (used identically on Library cards, tab strip, stepper)

| State | Visual | Never |
|---|---|---|
| `complete` | ✓ in `sage-deep`, chip bg `sage-bg` | — |
| `active` | filled `sage` dot + 3–4px `sage-bg` halo, label in `ink` semibold | — |
| `pending` | hollow dot, `muted`/`faint` label | — |
| `skipped` | dimmed label + "Not needed" (dashed-border chip or italic sub-label) | **No strikethrough, no italic-only** — current tab strip styling reads as broken |

State is never colour-alone: every state pairs colour with a mark (✓ / ● / number
/ "Not needed" text).

---

## 2 · Surface A — Global chrome (all authenticated pages)

**Replaces:** the current white top bar (`/home`, `/lobby`, project layout) and,
eventually, the legacy headers on standalone pages.

1. **Header** (charcoal, 56px): left — wordmark "AuthorsLab" in the serif +
   mode label ("Author", italic, faint); inside a project, a divider then
   "← Projects" back link. Centre — current project title (serif italic);
   empty outside projects. Right — notification bell (terracotta dot when
   unread; NotificationBell component exists) and a **profile chip with
   dropdown** (avatar initial, first name, chevron → account/billing/sign-out).
   This replaces the plain-text "Signed in as {name}".
2. **Left rail** (charcoal, 64px, full height): AuthorsLab mark on top, then
   **Home** and **Projects** only (standing decision — not a 5-item rail).
   Active item: soft dark chip + 3px sage left edge. Icons + 8.5px labels.
3. The existing Design-tab auto-collapse behaviour is unaffected.

**Also in this pass (trivial but demo-visible):**
- `layout.tsx` metadata title says **"AuthorLab.ai"** — missing the "s". Should
  read "AuthorsLab". This is the browser-tab title during the demo.
- The `alert()` behind Home's "Make this a project" CTA must go before any demo
  (route it to the Library / new-project modal).
- BetaBanner placement on the redesigned chrome: **open question for Paul** —
  suggest it disappears from authenticated redesigned surfaces.

## 3 · Surface B — The Library (replaces current `/lobby` list)

Per AL-UX-003 view 1:

1. Serif greeting ("Good morning, {name}.") + one-line summary
   ("Three books in the making." / count of in-studio vs with-Eden).
2. **Book cards**, one per project: a rendered mini book cover (92×134,
   typeset title + author on a palette cover — charcoal/sage-deep/terracotta
   rotation until real covers exist; `cover_url` slots in when present),
   title + genre + word count + updated-at, a **mini journey spine** (5 dots in
   the state grammar, live stage carries detail like "Line edit · Ch. 4 of 12"),
   and a **Next line**: persona avatar + one sentence + "Open →".
   Whole card clicks through to the project Overview.
3. **Begin-a-new-book** dashed card naming both paths (upload / ghostwriter) —
   opens the existing NewProjectModal fork.
4. Launched books: keep the current section split; style the "Launched" state in
   the grammar (sage-deep ✓) when one exists.

The current card's derivation logic (`deriveStageStates`, `nextActionFor`,
`editorForPhase`) carries over — this is a re-skin plus the mini-spine, not a
data change.

## 4 · Surface C — Project dashboard (new "Overview" tab)

Per AL-UX-003 view 2. **This is the new default landing inside a project** —
`/projects/[id]` renders Overview instead of redirecting to a phase tab.
(Deliberate design change: authors land on their book, then step into the
studio. The redirect logic moves into the Overview's primary CTA.)

Layout, two columns (300px / flexible):

1. **Left — the book object:** large typeset cover (225×330; real `cover_url`
   when it exists), word count / chapters / uploaded date / version, and
   **On your shelf** — the project's document list (assessment PDFs, line-note
   PDFs, current manuscript file) with coloured-spine icons.
2. **Right — greeting + stepper:**
   - **Editor greeting card:** active persona avatar, kicker
     (`Author Studio · Line edit · with Sam`), headline, 1–2 sentence message,
     primary CTA ("Continue with Sam →" → the studio tab) + secondary
     ("Read Sam's notes"). Phase 1: template the message per phase/status
     (same pattern as `nextActionFor`); a future iteration can generate it via
     the existing AI infra — not required for the demo.
   - **Journey stepper**, five steps in the state grammar with per-step copy,
     the live step carrying a progress meter ("Chapter 4 of 12") and a
     mini-CTA; the step after the live one carrying a gate-hint line
     ("Unlocks after your sign-off on the edited draft").

## 5 · Surface D — Project tab strip (restyle)

- Add **Overview** as the first tab.
- Apply the state grammar: live stage = sage dot; complete = sage-deep ✓;
  skipped Ghostwriter = dimmed with "Not needed" tooltip — **remove the
  strikethrough/italic**.
- Keep the journey/tools split (divider before Research · Script); Script keeps
  its "Soon" pill (small caps chip, not italics).

---

## 6 · Data needs

Mostly derivable from what exists. In demo-priority order:

| Need | Source | Status |
|---|---|---|
| Stage states, next action, persona | `current_phase_number` + `status` (existing derivations) | ✅ exists |
| Word count, genre, chapters, updated | `manuscripts` (+ chapter count if not stored) | mostly exists — confirm chapter count |
| "Chapter X of Y" live progress | Author Studio state (`as_journeys` / studio state API) | needs a small read endpoint or field on the project payload |
| Shelf documents (assessment / line notes / manuscript file) | wherever phase PDFs live today | needs enumeration endpoint — **demo-critical** (the shelf sells the service) |
| Editor greeting copy | phase-templated strings | phase 1: hardcoded templates |
| Resolved-points count, activity feed | Wave-1 ledger rows | **nice-to-have** — cut freely if time is tight |

## 7 · Suggested phasing (Platform Dev owns the real sequencing)

1. **Tokens + chrome** — palette/typography as shared tokens; header + rail on
   `/home`, Library, project shell. Title-tag fix and alert() removal ride along.
2. **Library** — re-skin of `/lobby` (data already there).
3. **Overview tab** — layout with derivable data + templated greeting; shelf
   with whatever documents are enumerable today.
4. **Tab strip restyle** and the progress/gate details.
5. (Post-demo) activity feed from the ledger, generated greetings, real covers
   from Taylor's flow.

Steps 1–3 are the demo-credibility core.

## 8 · Out of scope here

- Author Studio interior (boundary).
- Home/companion restyle beyond the shared chrome (same palette applies
  naturally; no layout change asked).
- Jewish-imprint brand adaptation for the September demo — separate memo
  (AL-UX-005) once Paul and I have had that conversation.
- Ghostwriter surfaces — already native to this palette; unify chrome only.

## 9 · Open questions (for Paul, or bounce back to me)

1. BetaBanner on redesigned authenticated surfaces — drop it?
2. Chapter count for "Ch. X of Y" — stored today, or derivable from parsing?
3. Are the assessment/line-note PDFs already per-project queryable?
4. Cover placeholders: procedural typeset covers (as mocked) OK until Taylor's
   cover flow lands?

— UI/UX Design station
