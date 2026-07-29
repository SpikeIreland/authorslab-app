# AL-UX-004 Phase 0/1 · completion

**AL-PDC-UX004-C1 · 2026-07-28**
**From:** Platform Developer station
**Status:** COMPLETE on the `redesign` branch. Awaiting Paul's Vercel-preview review before Phase 2.

## 1 · What shipped

### Design tokens (globals.css)
Full Manuscript Room palette + typography seeded as Tailwind v4 `@theme` tokens:

- Colours: `ivory`, `paper`, `paper-warm`, `charcoal`, `ink`, `muted`, `faint`, `line`, `line-soft`, `sage`, `sage-deep`, `sage-bg`, `terracotta`, `amber-bg`
- Fonts: `--font-serif` (Iowan Old Style → Palatino → Georgia stack), `--font-sans` (system)
- `.kicker` utility class (11px uppercase tracked, muted colour)

Everything is reachable as CSS variables (`var(--color-sage-deep)`) OR Tailwind utility classes (`bg-charcoal`, `text-ink`, `font-serif`). All future components use these.

### Chrome components (`src/components/chrome/`)
- **`AppShell.tsx`** — composes Header + LeftRail + content, ivory background
- **`Header.tsx`** — charcoal 56px, wordmark "AuthorsLab" (serif) + "Author" italic kicker, optional project title in centre, `← Projects` back link inside projects, bell + profile chip on the right
- **`LeftRail.tsx`** — charcoal 64px, Home + Projects only (two-rail decision honored), active-item chip with sage left edge
- **`ProfileChip.tsx`** — avatar initial + first name + chevron, dropdown with Account (coming-soon), Billing (coming-soon), Sign out (functional → `/login` after Supabase sign-out)

### Mounted on
- `/home` — AppShell wraps the two-pane chat, old white header stripped
- `/lobby` — AppShell wraps the projects list, old header stripped
- `/projects/[id]/layout.tsx` — AppShell wraps the project shell (server component), passes `projectTitle` for the header centre; old brand bar + project header both stripped; ProjectTabStrip and content slot render inside AppShell's children

### Trivial fixes riding along
- **Title tag fix**: `AuthorLab.ai - AI-Powered Author Services` → `AuthorsLab` (metadata in `layout.tsx`)
- **BetaBanner unmounted** from `layout.tsx` (per Q1 answer in the plan doc — component preserved for future public-page use)
- **`alert()` removed** from home's "Make this a project" CTA — now routes to `/lobby`
- **`// ← ADD THIS` cruft comments** removed from `layout.tsx`
- **Unused `Link` import** removed from `home/page.tsx`

## 2 · Verification

- ✅ TypeScript compiles clean (`tsc --noEmit --skipLibCheck` returns no errors)
- ✅ ESLint has no warnings on any of the 8 touched files
- ✅ NotificationBell already accepted `variant="dark"` prop — no change needed there

## 3 · What Paul reviews now

Visit the Vercel preview and check:
1. **`/home`** — chat interface should be unchanged in behaviour; framed by the new charcoal chrome; profile chip shows first name; bell shows unread count if any.
2. **`/lobby`** — projects list should be unchanged in behaviour; same new chrome.
3. **Any project** (e.g. `/projects/<id>`) — new chrome with project title centred in the header; `← Projects` back link visible; existing tab strip and content unchanged (that's Phase 4's scope).
4. **Browser tab title** should read "AuthorsLab" (not "AuthorLab.ai").
5. **Profile chip dropdown** — Account/Billing show as greyed "coming soon"; Sign out works.
6. **Left rail** — should feel present but subtle; active item (Home vs Projects) has a soft chip and a thin sage stripe on its left edge.

Palette + typography feedback lands here. If the serif reads wrong on macOS/iOS, that's the token choice — easy to swap.

## 4 · Not in this phase (deliberately)

- **Library re-skin** (book cards, mini journey spines, next-line preview) — Phase 2
- **Project Overview tab** (new default landing inside a project) — Phase 3
- **Project tab strip restyle** — Phase 4
- **Jewish-imprint brand adaptation** — separate memo AL-UX-005

## 5 · What blocks Phase 2

Paul's greenlight after visual review. If palette or typography needs revision, we fix in the tokens before Phase 2 starts (all components inherit — one change propagates).

— Platform Developer station
