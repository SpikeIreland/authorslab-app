# Build brief — Author Studio reskin in place

**AL-UX-007 · 2026-07-29**
**From:** UI/UX Design station (via Paul as courier)
**To:** Platform Dev station
**Decision owner:** Paul — scope decided 2026-07-29: **reskin in place**. Same layout, same panels, same interactions. Only the visual layer changes.
**Sample:** `docs/sis/design/2026-07-29-AL-UX-007-studio-reskin-sample.html`

---

## 0 · Scope and the rule that governs it

The standing "don't redesign Author Studio" boundary is **partially lifted**: the
interior may be **re-tinted, not re-arranged**. Concretely:

- ✅ Colour tokens, borders, shadows, radius values, icon/emoji glyph swaps,
  text-colour changes.
- ❌ No layout moves, no panel resizing, no component restructuring, no
  interaction or copy changes (one exception: chrome emoji, §4), no changes to
  the contentEditable editor behaviour.

Betas work in this surface daily — every change must be visually verifiable as
"same screen, new clothes" in a side-by-side.

## 1 · The persona quintet (the one real design change — Paul to ratify)

The studio colour-codes almost everything by editor. The current five
(green/purple/blue/teal/orange Tailwind 600s) clash with the Manuscript Room;
but a naive swap to the app's ambient persona tints (sage / terracotta /
sage-deep / clay / faint) **fails colour-vision-deficiency validation** — Alex
and Jordan become near-identical, Taylor and Riley indistinguishable even with
full colour vision (validated computationally, ΔE 4.5 worst pair).

So AL-UX-007 introduces a **validated persona quintet** — warm, literary, and
machine-checked for separation (all checks pass; the two remaining advisories
are covered because every persona surface carries an initial + name):

| Editor | Fill (600-role) | Light (50-role) | Text-on-light (700-role) |
|---|---|---|---|
| Alex | `#4A8340` | `#EEF4EA` | `#3A6832` |
| Sam | `#D08A4F` | `#FBF1E6` | `#A56531` |
| Jordan | `#0B7A5C` | `#E7F2EE` | `#0A614A` |
| Taylor | `#BC9440` | `#F8F2E2` | `#8F6F2C` |
| Riley | `#84500E` | `#F5EBDE` | `#6B400B` |

Principle this establishes app-wide: **identity ≠ state.** Persona colours say
*who*; the state grammar (sage active / sage-deep complete) says *where you
are*. The studio's active-editor ring becomes the sage halo regardless of which
editor is active. This also fixes the pre-existing collision where an unsaved
chapter dot (blue) was indistinguishable from Jordan-ready (blue) — unsaved now
uses the status `warn` colour (§3).

Follow-up (small, separate): the Overview/Library stage cards shipped with the
ambient tints for Taylor (`#A98A6B`) and Riley (`faint`); update to the quintet
so the same person is the same colour everywhere. Also reconciles the wrapper's
three hardcoded hexes (`#639922`/`#7F77DD`/`#378ADD`) — see §5.3.

**DB note:** `activePhase.editor_color` keys (`green`/`purple`/`blue`/`teal`/
`orange`) stay unchanged — only the class values behind `getEditorColorClasses`
change. No migration.

## 2 · Neutral + action token map

| Today (studio) | Becomes | Notes |
|---|---|---|
| `bg-gray-50` page/toolbar | `ivory #FAF8F4` | |
| `bg-white` panels/cards | `paper #FFFFFF` | unchanged |
| `bg-gray-100` hovers | `paper-warm #FDFBF7` | |
| `bg-gray-200` disabled/locked fills | `line-soft #F0EBE2` | check contrast with `faint` text (§6.3) |
| `border-gray-200` dividers (20×) | `line #E8E2D8` | |
| `border-gray-300` inputs | `line`, focus `sage-deep` | |
| `text-gray-900 / 700 / 600` | `ink #2C2C2C` / `ink` / `muted #8A857C` | |
| `text-gray-500 / 400 / 300` | `muted` / `faint #B5AFA4` / `faint` | |
| `bg-blue-600` primary actions + hovers | `sage-deep #5C7A6B`, hover `#4E6A5D` | Save, retry, etc. |
| `text-blue-600` links | `sage-deep` | |
| User bubble `bg-blue-50/border-blue-200` | `paper-warm` + `line` | |
| Author avatar `blue-500`/blue-purple gradient | `charcoal` (photo ring: `line`) | matches app chrome |
| Yellow warning btn (`yellow-100/800/300`) | `amber-bg #FDF6EE` + text `#8F5A2E` + border `terracotta` | |
| `.issue-highlight` hex (`#fef3c7`/`#fbbf24`) | `#F6E7C9` / `#D4956A` | edit `highlightStyles` L57 — Tailwind can't reach it |
| Logo `blue-900→700` clip-text gradient | serif wordmark, `ink` — no gradient | matches AL-UX-006 |
| Tricolour completion gradient | Alex→Sam→Jordan quintet stops | preserves the "all three done" meaning |
| Other decorative gradients (Meet-X CTAs etc.) | flat persona fill of the *next* editor | |

## 3 · Status trio (reserved — never reused for identity)

| Role | Value | Replaces |
|---|---|---|
| ok / low priority | `#5C7A6B` | `text-green-600` + 🟢 |
| warn / medium / unsaved / in-progress | `#C07A3E` | `text-orange-600` + 🟡, `bg-yellow-50` row tint → `amber-bg`, unsaved blue dot |
| high priority / destructive | `#B85C48` | `text-red-600` + 🔴, delete affordances |

**Severity emoji (🟢🟡🔴⚪) are replaced by a CSS dot + the existing label**
(`getSeverityIcon` → a `<span>` with the status colour). The emoji circles
can't follow a palette; this is the sharpest trap the audit found.

**Issue category chips** keep the owning editor's light/text pair **and gain a
small persona-initial disc** (see sample) so "whose note is this" survives for
colour-blind authors. This is the one sanctioned micro-content change inside
cards.

## 4 · Chrome glyphs (recommended, severable)

Replace UI-chrome emoji with plain glyphs/Lucide equivalents per the AL-UX-006
no-emoji rule: 📚 logo (goes with the wordmark change), 📄 on report/change
buttons → `FileText`, 🔒 → `Lock`, 👋/🎉/🚀 on Meet/Completion CTAs → none
(text + arrow), 📖 → `BookOpen` (already imported), 👆/💬 hints → text only.
Emoji **inside AI chat message strings are content, not chrome — leave them**
(separate conversation if Paul wants the editors' voices tidied). If time is
short, this whole section can ship later; it's independent of the colour work.

## 5 · Engineering pointers (from the design-side audit — verify, don't trust)

1. **`getEditorColorClasses` (L166–220) first** — ~a third of the UI re-tints
   from that one map. Then the hardcoded duplicates that bypass it: header
   avatars (L2657–2790), report buttons (L2835–3020), D/L/C badges
   (L3090–3115), spinner `border-t-*` (L3432–3437).
2. **Bug found while auditing (pre-existing):** L366 builds
   `hover:${...borderLight}` at runtime — Tailwind's scanner can't see it, so
   the chapter-row hover border likely never renders. Fix or drop while in
   there.
3. **Wrapper reconciliation:** `/projects/[id]/author-studio/page.tsx` passes
   editor colours as raw hex (`#639922`/`#7F77DD`/`#378ADD`) via three
   `style={{}}`s — today Alex is olive in the shell and emerald in the studio,
   one click apart. Point both at the quintet tokens.
4. **Gray→warm sweep:** studio is 100% `gray-*` (116 uses), the shell is 100%
   `slate-*` — after this brief both should be the warm neutral set; no `gray-*`
   or `slate-*` should remain on either side of the seam.
5. External components rendered inside the studio need the same treatment to
   avoid seams: `VersionsDropdown`, `FeedbackModal`, `NotificationBell`
   (incl. its `variant="dark"` path), plus whatever BetaBanner's fate is
   (AL-UX-006 truth-table §1.9).
6. The manuscript surface keeps `font-serif` — with the app's serif stack now
   in tokens it inherits the Iowan/Palatino line, which is the point.

## 6 · Contrast obligations (checked in the sample; re-verify in build)

1. White text sits on every filled button — all five quintet fills pass ≥3:1
   for the large/bold usage they get; **do not lighten the fills**.
2. `Sam #D08A4F` and `Taylor #BC9440` are below 3:1 against ivory as *hairline
   marks*; they are only ever used with initials/labels — keep it that way.
3. Locked/disabled `line-soft` + `faint` pairing is ~2.4:1 — same as today's
   gray-200/gray-400, intentionally quiet; don't go quieter.

## 7 · Verification & rollout

1. Build behind a branch preview; produce **side-by-side screenshots** of each
   region (header, sidebar, editor, chat, issues drawer, modals) old vs new —
   the acceptance test is "identical geometry, new palette."
2. Check every spinner/ring/badge state reachable via phase simulation
   (locked / available / active × 5 editors).
3. Beta users: a one-line in-app note ("The studio has a new coat of paint —
   everything works exactly as before") — Paul approves wording/channel since
   all current users are under our management.

## 8 · Out of scope

Layout/interaction changes of any kind; the wrapper bridge-page's *structure*
(its own redesign is a future pass, noted in the handback); AI message copy;
AL-UX-005 imprint work; real cover art.

## 9 · Open questions

1. Paul — ratify the quintet (§1) as the app-wide persona set (it supersedes
   the ambient Taylor/Riley tints from AL-UX-004).
2. Platform Dev — `EDITOR_CONFIG` in `@/types/database`: does it carry colour
   values too? (Not visible from the design-side file set.)
3. Platform Dev — preferred vehicle for the quintet: extend the `@theme` tokens
   from AL-UX-004, or a small persona-token module both studio and shell import?

— UI/UX Design station
