# Build brief — Public pages in the Manuscript Room language

**AL-UX-006 · 2026-07-29**
**From:** UI/UX Design station (via Paul as courier)
**To:** Platform Dev station
**Decision owner:** Paul — sequencing decided 2026-07-29: AL-UX-006 before AL-UX-005; scope = restyle **plus copy/IA pass**
**Mockup:** `docs/sis/design/2026-07-29-AL-UX-006-landing-mockup.html` (landing page — sets the pattern for every other public page)

> **Status update 2026-07-29 (Paul):** Approved to push to production. All current
> site traffic is under our management, so truth-table placeholders may ship
> while answers land — the immediate goal is a shareable site for team feedback.
> Pricing figures still pending from Paul. Hero features Carl Lyons's Flame
> series: *The Veil and the Flame*, *The Signal and the Shadow*, Book III TBC.
**References:** AL-UX-004 brief (tokens, grammar — all shipped), AL-PDC-HANDBACK-001

---

## 0 · The decision

The public routes — `/`, `/pricing`, `/faq`, `/how-it-works`, `/editors`,
`/free-analysis`, and the auth cluster — adopt the Manuscript Room identity that
now runs the app, **and** get a copy/IA pass at the same time. The old pages sell
a $299 one-off, five-vs-three contradictory phases, and a "Q4 2025" roadmap; the
rewrite aligns every page with what the product now is: a multi-project
subscription platform with a named editorial team.

Blue/purple gradients, emoji iconography, and per-page copy-pasted navs all go.

## 1 · Content truth table — RESOLVE BEFORE BUILD

The audit found the public pages contradicting each other. These need one answer
each (Paul or Platform Dev where marked); the rewrite then uses that answer
everywhere. **Items marked ⚑ block the pricing/FAQ pages but not the chrome or
landing work.**

| # | Question | Today's contradiction | Proposed answer (Design) |
|---|---|---|---|
| 1 ⚑ | Subscription tiers + figures | $299 one-off everywhere; $399 "Complete Author Package" on free-analysis | From Paul's subscription model (financial-model work, July 2026). Mockup shows structure only |
| 2 | Phase availability | Landing/pricing/how-it-works say 5 live; FAQ says 3 + "Q4 2025" | Platform is complete (per Paul, 2026-07-29) → all stages live; purge every "Q4 2025" |
| 3 | Marketing persona name | Public pages: **Quinn**; product + AL-UX-004: **Riley** | Standardise on **Riley** (the product wins) — Paul to confirm |
| 4 | Persona roles | Public: Sam "line", Jordan "copy" ; app journey: Sam "line edit", Jordan "final polish" | Use the app's journey labels (First read / Line edit / Polish) |
| 5 | Eden on the public site | Absent entirely | Add — Eden is the front door and the ghostwriter path is a real acquisition story |
| 6 | Free-analysis turnaround | 5 min (pricing, FAQ) vs 15 min (the page itself) | Platform Dev states the real number; use it everywhere |
| 7 | Accepted formats | FAQ: docx/pdf/txt/rtf; free-analysis: PDF only 10MB | Platform Dev states reality; copy follows |
| 8 | Refund policy | On FAQ only, tied to the $299 product | Rewrite for subscription (cancellation terms) — Paul |
| 9 | Beta banner | "$299 rate" banner on every page incl. auth | Retire it (beta framing contradicts the pivot) — Paul to confirm |
| 10 | Testimonial | Carl labelled "What Authors Are Saying" | Reframe honestly as the founding story (as mocked) until real author quotes exist |

## 2 · Shared marketing chrome (build once, use everywhere)

- **`MarketingNav`** — one component replacing six inline copies. Ivory,
  blur-on-scroll, hairline border. Wordmark (sage mark + serif "AuthorsLab" — no
  📚, no ".ai"), links How it works · Your editors · Pricing · FAQ · Sign in,
  and one sage-deep CTA ("Start your book"). Mobile: collapse to menu.
- **`MarketingFooter`** — none exists today on any page. Charcoal band:
  "© 2026 AuthorsLab · a Spike Island Studios company" + How it works / Pricing /
  FAQ / **Privacy / Terms / Contact**. (Legal page content is an open input —
  see §5.)
- **Tokens:** identical to the app (they're in `globals.css` already). Marketing
  pages get two band styles: ivory (light) and charcoal (dark) — no gradients.
- **Iconography:** no emoji. Persona identity = the app's coloured initial
  discs; checks/dots from the state grammar; book objects as the illustration
  language (see mockup hero).
- `metadata` exports per page (title/description) — none exist today; the
  browser tab is part of the demo.

## 3 · Page by page

### `/` Landing — per the mockup

Hero ("Every book deserves an *editorial team*." + book-object collage using the
procedural covers), dark journey band (Eden → Alex → Sam → Jordan → Taylor &
Riley in persona discs on the journey spine), Author Studio section (framed
product vignette — swap the mocked vignette for a real screenshot of the shipped
Overview once staged content exists), membership teaser (two tiers, figures TBD
per §1.1), founding-story card (Carl, honestly labelled), charcoal final CTA +
footer. **Cut entirely:** "Video Coming Soon" section, "This could be YOUR book"
badge, all $-anchor claims until repriced messaging is decided.

### `/how-it-works`

Keep the five-stage explainer structure — it's good IA. Re-tint phase panels to
the palette (sage/terracotta/sage-deep/clay tints, not green/purple/blue/teal/
orange), align stage names + personas with §1.3–1.5, keep the "you keep 100%
ownership / you click publish" framing (it's a genuine differentiator and true),
platforms grid stays. Purge stale cost anchors or source them properly.

### `/editors` → "Your editors"

Alternating profiles stay; add **Eden** (and the ghostwriters Ivy & Reid as a
sub-note on the Begin stage). Persona discs replace emoji-gradient avatars. Fix
the five unclosed pull-quotes. Soften "trained on thousands of published novels /
Chicago Manual" provenance claims to capability statements. Fix the floating
PHASE badges (no mobile handling today).

### `/pricing`

Full rewrite around the subscription (⚑ blocked on §1.1). Keep: free assessment
as the lead offer; a single honest comparison of what membership includes; FAQ
snippets that *link* to the FAQ rather than duplicating drift-prone answers.
Cut: the traditional-cost arbitrage table in its current form (numbers were
already inconsistent page-to-page); beta-pricing urgency copy.

### `/faq`

Content rewrite against the truth table (§1) — the page is the worst offender:
"3-Phase Package", six "Q4 2025" mentions, contradictions within single answers.
Keep the accordion + category structure; restyle to warm palette; category
numbers in serif discs; make `support@authorslab.ai` a real mailto link.

### `/free-analysis` → "Free manuscript assessment"

Restyle from infomercial (green/yellow/red) to the system: calm ivory page, one
card, the form, one upgrade pointer to membership. Fix **$399 → membership
framing** (the only wrong price on the site, on the highest-intent CTA). Unify
turnaround + formats per §1.6–1.7. Restore full nav.
**Platform bug found in audit, not design:** the submit `catch` shows the
success screen on webhook failure — users get false confirmation. Flagging for
Platform Dev regardless of restyle.

### Auth cluster (`/login`, `/signup`, + forgot/update-password)

Replace the blue/purple gradient full-bleed with the Manuscript Room: ivory
page, paper card, serif headline ("Welcome back." / "Begin."), sage-deep
buttons, wordmark linking home. Delete dead `AuthFormWrapper.tsx` (it still says
"AuthorLab.ai") or rebuild it as the real shared wrapper in the new language —
Platform Dev's call. Flag: signup has no terms/privacy consent affordance and
"Remember me" is decorative; fix alongside (needs §5 legal pages).

## 4 · Copy voice (for every rewritten page)

The app's voice, carried outward: calm, concrete, editorially confident.
Serif for meaning, sans for interface. No exclamation-mark urgency, no
"BREAKTHROUGH", no scarcity framing. Personas are *named colleagues with jobs*,
not features. Say what's true; where social proof doesn't exist yet, say the
honest thing (the founding story) rather than simulate it.

## 5 · Inputs needed (not from Platform Dev)

1. **Subscription tiers + prices** — Paul, from the subscription-model work.
2. **Privacy policy, Terms, Contact** page content — currently the site has
   none, while taking payments and PII. Who drafts these? (I can produce
   working drafts for review if Paul wants.)
3. Real author quotes when any exist (replaces founding-story card over time).

## 6 · Phasing

1. **Chrome** — MarketingNav + MarketingFooter + metadata, applied to all
   public routes; BetaBanner retired (pending §1.9). Instant coherence win.
2. **Landing** — per mockup; no pricing-figure dependency (teaser can ship with
   "from £—" resolved or the section held back a few days).
3. **How-it-works, Editors, FAQ** — restyle + truth-table rewrite.
4. **Pricing** — once §1.1 figures land.
5. **Free-analysis + auth cluster** — restyle + the flagged fixes.

Phases 1–3 are the "site no longer argues with itself" core; 4–5 complete it.

## 7 · Out of scope

- AL-UX-005 imprint adaptation (next brief; decided direction: restrained
  literary nod — demo content + tasteful touches, no niche lock-in).
- Ghostwriter persona surfaces (Eden intake, Ivy/Reid chats) — separate design
  pass, noted in the handback backlog.
- App surfaces (shipped under AL-UX-004; untouched here). Author Studio
  interior remains off-limits.

## 8 · Open questions for Platform Dev

1. Free-assessment turnaround + accepted formats (truth table §1.6–1.7) — what
   does the pipeline actually do today?
2. Is the checkout flow already subscription-capable (signup currently routes
   non-beta users to `/checkout` for the one-off), or does AL-UX-006 pricing
   land together with billing changes? Affects phase 4 sequencing.
3. Preference on `AuthFormWrapper`: delete vs rebuild as shared auth shell.

— UI/UX Design station
