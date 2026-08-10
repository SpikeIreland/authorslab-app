# Persona and stage naming — summary for Marketing / positioning readers

**AL-GWC-N-005 · 2026-07-30 · Ghostwriter Line station**
**For:** Marketing chat / Demo & Content Ops chat / anyone touching prospect-facing copy or positioning
**Reason for filing:** three naming decisions landed today, one in-flight. This note collects them in one place so positioning work can plan against the current picture without having to reassemble it from the coordination docs. Companion documents cited inline.

## The three decisions

### 1 · Eden → Riley  **[DONE — in code]**

**What it is:** the Ghostwriter-companion / onboarding matcher persona. The "warm gatekeeper" who asks the author five questions and matches them to Ivy or Reid.

**Why the change:** authorised by Paul via Platform Dev memo AL-PDC-GW-UPDATE-001. Rationale: gender-neutral, warm, literary. "Eden" was reading as feminine to some users; the persona quintet works better when every name reads person-first, not gender-first.

**Status:** in-app code fully renamed (Ghostwriter flow, project shell, overview, API system prompts, lobby derivations, onboarding, tab placeholder). n8n deployment pending — Paul updates workflow 7.01 (id `mvOMgVKOkqh5hD2b`) and webhook path `eden-match` → `riley-match`. Frontend is written to accept either payload field name (`rileyReflection` or `edenReflection`) so nothing breaks during the deploy window. Public marketing pages **not touched** — see §3 below.

**Full detail:** `docs/sis/ghostwriter/2026-07-30-eden-to-riley-n8n-coordination.md`

### 2 · Marketing Riley → Kai  **[DONE — in code]**

**What it is:** the Marketing lead persona (phase 5 of the project journey — launch planning, audience, pitch, content, reviews, post-launch performance).

**Why the change:** freed up "Riley" for the Ghostwriter role in decision #1. Kai is short, crisp, gender-neutral, distinct, and doesn't collide with any other persona name.

**Status:** in-app code fully renamed (overview logic, marketing tab UI, API system prompts, lobby derivations). Colour swap: Kai inherits the `--color-faint` colour previously held by Marketing Riley. **CSS variable names not renamed** — `--color-riley`, `bg-riley`, `text-riley-text` etc. still exist across the codebase and now internally back Kai's colour tokens. That's a cosmetic inconsistency, not a bug, and best done as a separate atomic cleanup dispatch. Public marketing pages **not touched** — see §3 below.

**Full detail:** same coordination brief as above.

### 3 · Ghostwriter → Wright  **[LEANING — awaiting Paul + Carl confirmation]**

**What it is:** the whole *stage / category* name. Not a persona name. The tab in the project shell (`/projects/[id]/ghostwriter`), the database table prefix (`ghostwriter_sessions`, `ghostwriter_sections`, `ghostwriter_chat`), the whole first phase of the author journey where a project without a manuscript gets drafted.

**Why the change:** Paul's reasoning, verbatim in spirit: "Ghostwriter" implies AI is doing the work in the shadows and the human takes the credit. That misrepresents both the product (Ivy and Reid ask, reflect, surface raw material, build the section map from the author's own words — closer to the opposite of ghostwriting) and the philosophical position Paul is trying to hold in the wider AL story: AI as the pressure that draws out human capability, not the mechanism that replaces it.

**Why "Wright":**
- Old English suffix (playwright, shipwright, wheelwright, cartwright) meaning "one who works in a craft"
- Homophone with "write" — phonetically identical, so "my Wright is helping me with chapter three" reads on the ear as "my writing"
- Single syllable, distinctive, ancient
- Not gendered
- Not overused in tech (unlike Catalyst, Hub, Studio)
- Carries craft-honouring weight — the maker isn't the AI, the AI is the working relationship in which making happens
- Brand potential: Paul sees an old-English calligraphy treatment as visual anchor

**Status:** Paul is leaning strongly toward "Wright." Discussing with Carl before final commit. Alternatives that were seriously considered and set aside:
- **Muse** — precise classical meaning, but historically feminine-coded
- **Wayfinder** — clean single word, navigational metaphor, but has slight cultural specificity (Polynesian navigation tradition — arguably no longer disqualifying but flagged)
- **Musewright / BookWright** — compound forms; Paul's read is they dilute the elegance of "Wright" alone
- **Catalyst** — accurate but overused in tech marketing

**If Wright confirms:** this is a bigger rename than Eden → Riley because it touches the database schema. Ripple:
- Schema (SysAdmin dispatch): `ghostwriter_sessions` → `wright_sessions`, columns like `author_profiles.ghostwriter_agent` → `wright_agent`, `has_ghostwriter_access` → `has_wright_access`, etc.
- Code (Ghostwriter Line): all references to Ghostwriter/ghostwriter renamed
- n8n workflow names (Paul deploys)
- Public marketing pages (Demo & Content Ops decision — see §3 below)
- Historical SIS documentation (leave alone with top-line rename note, same discipline as Eden → Riley)

Ghostwriter Line will file a formal coordination dispatch once Paul confirms the name so all sibling stations act atomically.

## The persona roster after all three changes

Assuming Wright confirms:

| Role | Persona name(s) | Colour | Space (sacred/shared) |
|---|---|---|---|
| Home / Companion | Companion (placeholder) | — | Sacred |
| Wright matcher | Riley | Sage | Sacred |
| Wright drafters | Ivy, Reid | Terracotta, sage-deep | Sacred |
| Developmental editor | Alex | Sage | Sacred |
| Line editor | Sam | Terracotta | Sacred |
| Copy editor | Jordan | Sage-deep | Sacred |
| Design | Taylor | #A98A6B | Shared-by-invitation |
| Publishing | Morgan (placeholder) | Amber | Shared-by-invitation |
| Marketing | Kai | Faint | Shared-by-invitation |

The sacred / shared distinction is the founding architectural principle per Platform Dev memo AL-PDC-GW-UPDATE-001 §2: sacred surfaces (Library, Project Overview, Wright, Author Studio, Companion) are private to the author and never leak to publisher-visible views. Shared-by-invitation surfaces (Design, Publishing, Marketing) are the ones an author explicitly opens to a named publisher. That distinction binds Kai's Marketing work directly: Kai sits in the shared space, so what Kai knows and produces is visible to invited publishers.

## Why this matters for positioning / marketing copy

The Wright decision, if it confirms, is the most consequential for marketing tone because it names the whole category. "Ghostwriter" is a category readers instantly understand (someone writes your book for you) — the recognition is the marketing engine. "Wright" is a category readers *don't* instantly understand — the strangeness is the marketing lever. That's a different comms strategy.

Two things worth Marketing chat's early thinking:

1. **The five-second explanation.** If a first-time visitor lands on the site and sees "Wright" as the tab, what's the phrase that lands the meaning without a paragraph? Suggestions: "your Wright — the writing you do, working alongside" or "Wright: the craft, honoured." Neither is right yet. This is Marketing's problem to solve, and it's a good problem — Ghostwriter was doing the naming work for us; Wright puts the burden back on the copy to explain what the category actually is.

2. **The philosophical positioning.** Paul's book (see `books/Book-Seed-The-Second-Shop-Floor.md`) argues that AI is the pressure that draws humans back toward what makes us unique, rather than the competitor that replaces us. Wright aligns with this — the AI works with the craft, the human is the maker. Marketing copy that leans into that philosophical thread gives Wright the frame it needs. Marketing copy that treats Wright as a synonym for Ghostwriter defeats the point of the rename.

## What's still open for Marketing to decide

1. **Public marketing page rename timing.** In-app code has been renamed today (Eden → Riley, Marketing Riley → Kai). Public pages have not: `src/app/page.tsx`, `src/app/faq/page.tsx`, `src/app/editors/page.tsx`, `src/app/how-it-works/page.tsx`, `src/app/pricing/page.tsx` still say Eden and Marketing-Riley. The choice is: (a) rename now as a coordinated public sweep, (b) stagger — quietly update in-app first (done), do public pages closer to September demo, (c) something else. Ghostwriter Line recommends (a) so prospects don't see mismatched names in-app vs. public, but this is Demo & Content Ops's call.

2. **Wright branding.** If the name confirms, does the old-English calligraphy treatment Paul sees fit the AuthorsLab palette (warm cream, sage, terracotta)? Needs testing against a real mark. Marketing / UX Design's territory.

3. **Kai's voice.** The persona name has changed but the underlying system prompt in `src/app/api/projects/[id]/marketing/chat/route.ts` was renamed mechanically ("You are Riley" → "You are Kai"). The tone Riley had — energetic, marketer-who-has-launched-many-books — carried over unchanged. If Marketing wants Kai to have a distinct voice from what Riley was, that's a system-prompt edit and worth doing as part of a broader Marketing persona pass.

## Cross-reference index

- Platform Dev memo announcing Eden → Riley + Marketing Riley → Kai: `docs/sis/platform-dev/2026-07-30-ghostwriter-station-update.md`
- Ghostwriter Line n8n coordination brief (deployment checklist for Paul): `docs/sis/ghostwriter/2026-07-30-eden-to-riley-n8n-coordination.md`
- Top-line rename notice for future readers of historical docs: `docs/sis/ghostwriter/2026-07-30-eden-to-riley-rename-notice.md`
- Sacred / shared architectural principle: Platform Dev memo §2
- Paul's book seed (the philosophical frame Wright fits into): `books/Book-Seed-The-Second-Shop-Floor.md`

*Filed by the Ghostwriter Line station. Please ping via `docs/sis/` if any of the three names change materially — this document should be re-filed rather than edited in place, so the register keeps its history.*
