# n8n & downstream coordination — Eden → Riley, Marketing Riley → Kai

**AL-GWC-N-003 · 2026-07-30 · Ghostwriter Line station**
**Consumes:** `docs/sis/platform-dev/2026-07-30-ghostwriter-station-update.md` (AL-PDC-GW-UPDATE-001)
**Companion:** `docs/sis/ghostwriter/2026-07-30-eden-to-riley-rename-notice.md` (top-line rename note for future readers)
**For:** Paul (n8n deployment), Platform Dev (legacy `/author-studio/`), Demo & Content Ops (public marketing pages).

## What I've done in code (all committed)

**Eden → Riley (Ghostwriter matcher):**
- `src/lib/n8n-config.ts` — `edenMatch` export → `rileyMatch`; webhook path `eden-match` → `riley-match`; docblock header updated
- `src/app/ghostwriter/page.tsx` — `EdenAvatar` → `RileyAvatar`, `'eden'` message sender → `'riley'`, `addEdenMessage/edenSays/runEdenMatch/edenReflection` → Riley equivalents, header label "Eden" → "Riley", greeting copy "Hi, I'm Eden" → "Hi, I'm Riley" (also "your book" → "your project" per D7 entity neutrality), avatar initial "E" → "R"
- `src/app/onboarding/page.tsx` — `edenMessage/setEdenMessage` state → Riley equivalents; returning-author greeting card comment and avatar initial "E" → "R"
- `src/app/lobby/_components/derivations.ts` — `activePersonaFor`/`nextActionFor` strings; `PersonaKey` type; `personaColourFor` mapping (Riley now inherits sage from Eden; Kai gets the faint colour Marketing Riley held)
- `src/app/lobby/_components/BookCard.tsx` — "Drafting with Eden" → "Drafting with Riley"
- `src/app/lobby/_components/PersonaAvatar.tsx` — colour map comment
- `src/app/projects/[id]/ghostwriter/page.tsx` — placeholder tab description
- `src/app/projects/[id]/_components/overview/overviewDerivations.ts` — `Persona` type, `greetingPersona`, `greetingMessage`, `primaryCta` — all Eden refs → Riley
- `src/app/api/projects/new/route.ts` — comment
- `src/app/api/home/chat/route.ts` — persona list in system prompt
- `src/app/api/projects/[id]/{marketing,research,publishing}/chat/route.ts` — persona lists in system prompts

**Marketing Riley → Kai (only where I was already editing shared/non-public files):**
- `src/app/lobby/_components/derivations.ts` — see above
- `src/app/projects/[id]/_components/overview/overviewDerivations.ts` — `greetingPersona`/`greetingMessage`/`primaryCta` for phase 5 + complete state
- `src/app/api/projects/[id]/overview/route.ts` — `PHASE_DEFAULTS` phase 5 editor `'Riley'` → `'Kai'`
- `src/app/api/projects/[id]/marketing/chat/route.ts` — `buildRileySystemPrompt` → `buildKaiSystemPrompt`, "You are Riley" → "You are Kai", comments (preserved the "ghostwriting (Riley/Ivy/Reid)" persona-list reference — that Riley is the Ghostwriter matcher, correctly)
- `src/app/api/projects/[id]/marketing/messages/route.ts` — comment
- `src/lib/marketing/launchTemplate.ts` — comment
- `src/app/projects/[id]/marketing/page.tsx` — all in-app Riley references (chat panel header, placeholder text, section descriptions) → Kai
- `src/app/api/projects/[id]/{research,publishing,design}/chat/route.ts` — persona list references to Marketing Riley → Kai

## What Paul needs to do in n8n

The frontend now calls a webhook at path `riley-match`. The n8n workflow is currently registered at path `eden-match`. Until the n8n side is updated, `runRileyMatch()` in the frontend will fetch a URL that returns 404 and fall through to the local matching fallback — the graceful path is intact but the LLM-driven reflection and Q1 title extraction won't happen.

Concrete deploy checklist:

1. **Workflow 7.01 Eden Match** (id `mvOMgVKOkqh5hD2b`)
   - Rename workflow: `7.01 Eden Match` → `7.01 Riley Match`
   - Rename webhook path: `eden-match` → `riley-match`
   - Any node names inside the workflow that contain "Eden" — update to "Riley"
   - System prompt text inside the workflow (the LLM's persona instructions) — every "Eden" → "Riley", every "your book" → "your project" (D7 entity neutrality), keep "she" pronoun per memo §2

2. **Response payload field name.** The workflow currently returns `edenReflection` in the JSON payload; the frontend is written to accept either `rileyReflection` (preferred) or `edenReflection` (backwards-compat) — see `ghostwriter/page.tsx:358`. Whenever you next edit the workflow, rename the output field to `rileyReflection` and I'll drop the backwards-compat shim.

3. **Postgres writes from n8n.** If any workflow writes `'eden'` as a string literal (e.g. into `ghostwriter_sessions.book_brief` or a station_id field), update to `'riley'`. My schema audit found no such writes today, but confirm during the touch.

4. **Craft Call migration.** Per the adoption notice, opportunistic-when-touched. This is a "next touch" of the Eden Match workflow, so migrate it to Craft Call in the same visit. Station id for LMO attribution: `riley.match`.

5. **Other Ghostwriter workflows** (`ivy-chat`, `reid-chat`, `ghostwriter-gap-analysis`) — no persona-name changes required (Ivy and Reid are unchanged). Only touch if their turn comes up for other reasons.

## What Demo & Content Ops needs to decide (public marketing pages)

**Files I did NOT touch:**
- `src/app/page.tsx` (marketing homepage) — line 53 features "Eden" as a persona, line 81 says "Taylor & Riley"
- `src/app/faq/page.tsx` — three Eden references (lines 18, 34, 43), and lines 141–142 "What does Riley do?" for Marketing Riley
- `src/app/editors/page.tsx` — full "Meet Riley" (Marketing) section, plus a comment on line 4 that literally says "marketing persona renamed to Riley" (now historically-inaccurate)
- `src/app/how-it-works/page.tsx` — multiple Riley (Marketing) references
- `src/app/pricing/page.tsx` — one Riley (Marketing) reference

**Why I didn't touch them:** these are prospect-facing pages. Changing "Meet Riley" → "Meet Kai" on the public site is a marketing/positioning decision that touches September demo prep and Jacky Klein. Not a Ghostwriter Line unilateral call.

The choice is: (a) do it all at once as a coordinated public-copy sweep before demo prep intensifies; (b) stagger — quietly update in-app first (done), do public pages closer to launch; (c) something else. Recommending (a) so returning prospects don't see mismatched names in-app vs. public. Deferring the decision to whoever owns demo/comms strategy.

## What Platform Dev needs to know (`/author-studio/page.tsx`)

Legacy 3,706-line file (beta users active). It has:
- Line 212: `orange: { // Riley` — colour comment for the Marketing colour class block
- Line 3356: `Start Marketing with Riley` button copy

Not my file to edit (Platform Dev's territory, active migration work per DP-CC-02+). Flag: needs the Marketing Riley → Kai update whenever DP-CC-06 or a similar dispatch touches the marketing button.

## CSS/Tailwind class names — not renamed, flagging as cleanup

`src/app/globals.css` defines `--color-riley`, `--color-riley-light`, `--color-riley-text` — these back the `bg-riley`, `text-riley-text`, etc. Tailwind classes used across `editors/`, `how-it-works/`, `author-studio/`, `FeedbackModal.tsx`, and `marketing/`. I left them alone: renaming CSS variables and Tailwind class names is a mechanical sweep of its own, best done as a single atomic pass (`--color-riley` → `--color-kai`, `bg-riley` → `bg-kai`, etc.). Functionally the current state is fine — Kai's colour tokens are named "riley" internally, a cosmetic inconsistency, not a bug.

Recommend a separate dispatch (e.g. `DP-CLEAN-01 · Marketing persona colour-token rename`) to do this whenever Platform Dev has bandwidth. I can execute it if that fits my dispatch queue better than theirs — either way, one atomic pass.

## What this doesn't touch

- **Database rows.** No `ghostwriter_sessions.ghost_writer`, `author_profiles.ghostwriter_agent`, etc. contain the string `'eden'` — those columns hold `'ivy'|'reid'`. No data migration required for the Eden → Riley rename. If the eventual station_id namespace populates rows containing `'eden.match'` etc. (via Craft Call ledger writes), those are wall-clock-history and stay under the old name; future writes go to `'riley.match'`.
- **n8n workflow deployment itself.** As above — Paul deploys, I've described.
- **`docs/sis/` historical documents.** Per memo §1 discipline: leave historical docs alone; the rename notice is the top-line update. This coordination brief and the rename notice at `2026-07-30-eden-to-riley-rename-notice.md` are the two new anchors from this date forward.

## Findings-register-worthy

Nothing rises to a finding. Two small process observations for future rename passes:
- **Case-sensitive `replace_all` on identifiers is hazardous** when a variable pair mixes case (`edenMessage` / `setEdenMessage`) — I hit this on `onboarding/page.tsx:20` and had to correct in a second pass. Trivial fix in retrospect; worth naming so the next rename sweep uses two passes (lowercase, then TitleCase) rather than one aggressive one.
- **Persona namespace lives across three surfaces** — code (identifiers + strings), CSS/Tailwind (colour tokens), and public marketing (external comms). A single-persona rename touched all three in different ways. If persona renames become a recurring pattern, consider a "persona registry" module that centralises the mapping so a rename becomes a single-file edit. Not urgent given the current cadence.
