# Staged rollout — how the public pages manage it

**AL-UX-010 · 2026-07-30 · UI/UX Design station (via Paul as courier)**
**Context:** Founding strategic decision 2026-07-30 (Paul + Carl): editing-studio
MVP ships first; Ghostwriter / Design / Publishing / Marketing unplugged for
staggered releases. Ref: `docs/sis/platform-dev/2026-07-30-marketing-chat-seed.md`.
**Audience:** all stations — this aligns the public-page treatment; Marketing
ratifies positioning language (their remit), this station owns the mechanism.

## 1 · The design position: honest roadmap, not amputation

Two ways to handle unplugged stations on the public site:

- **(a) MVP-pure** — remove every mention of the held-back stations until each
  releases.
- **(b) Honest roadmap** — the full journey stays visible, wearing the state
  grammar the product already speaks: what's *here now* vs what's *coming*.

**This station recommends (b).** The journey is the differentiator — an
editing tool is a crowded market; an editorial house that will carry your book
to launch is not. The staged strategy itself says every release gets a launch
beat: a visible roadmap is what makes each beat legible ("Design has arrived"
lands harder when Design was a promised next room). And mechanically, the
state grammar was built for exactly this — live dot, sage ✓, "Soon" chip — so
the site can say "coming" without a single false present-tense claim. The SIS
principle holds: *never faster than truth* — "coming" is true; silence is
just less useful truth. Marketing owns the final call; everything below works
under either answer, (a) simply deletes what (b) marks.

## 2 · The vocabulary (one treatment, used everywhere)

- **Live now:** normal presentation. Editors Alex, Sam, Jordan presented in
  full. The studio is "the product", not "phase 1 of 5".
- **Coming:** the small-caps chip the app already uses (`line-soft` bg,
  `muted` text — "Coming", not "Soon"; a public site earns the slightly more
  formal word). Coming stations get *name + one sentence*, never full
  feature marketing, never a CTA. No dates on the public site — release
  order only. Dates are launch-beat ammunition, not permanent copy.
- **Never:** disabled-looking grey blocks, "under construction", or removing
  the serif warmth from coming items — they're future rooms in the same
  house, not broken links.

## 3 · Page-by-page delta (the "little bit of work")

1. **Landing.** Hero unchanged — "every book deserves an editorial team" is
   true of the studio alone (Alex/Sam/Jordan *are* a team). Journey band:
   Alex/Sam/Jordan presented as live; Eden+ghostwriters, Taylor, and the
   marketing stage get "Coming" chips and their discs render at ~60%
   presence (still their colours — they're real, just not yet arrived).
   Studio vignette unchanged. Membership card bullet "Cover design,
   publishing prep, launch plan" → "New stages join your membership as they
   release — Design and Publishing are next." Founding story unchanged.
2. **How it works.** Restructures into two movements: "**How the studio
   works**" (First read / Line edit / Polish, full detail, present tense)
   and "**Where it goes next**" (a compact roadmap strip: Ghostwriter →
   Design → Publishing → Marketing, one sentence each, Coming chips). The
   platforms grid and you-keep-your-rights framing move under the roadmap
   section intro ("when Publishing arrives, here's how it will work — and
   here's what never changes: your rights").
3. **Your editors.** Alex, Sam, Jordan keep full profiles. Taylor and the
   marketing editor collapse into a single closing section — "**The house
   is growing**" — name, disc, one line, Coming chip. This *also* neatly
   sidesteps the public Riley→Kai rename until the marketing station's own
   launch beat: the section can simply not name the marketing editor yet
   ("a marketing editor joins for launch"), or name Kai from day one —
   **Marketing's call**, flagged as their first naming decision. Eden and
   the ghostwriters likewise fold into this section.
4. **Pricing.** Tier bullets scrubbed to studio truth: "Your full editorial
   team" → "Your editorial team — first read, line edit, polish"; the
   cover/publishing/launch bullet becomes the roadmap line from §3.1.
   Single-project pass copy: "the complete journey" → "the complete editing
   journey". Add one honest, load-bearing line to the membership section:
   "**Your membership grows: each new stage joins at no extra cost when it
   releases.**" (Confirm with Paul — it's a pricing commitment; if untrue,
   we say nothing rather than something vaguer.) Editorial-pass definition
   already only references studio passes — survives as-is.
5. **FAQ.** "Publishing your book" and "Marketing & launch" categories keep
   their answers, re-tensed: "When the Publishing stage releases, Taylor
   prepares…" — the substance (platforms, rights, royalties, ISBN) stays,
   the tense tells the truth. "What if I haven't written my book yet" →
   points to the coming Ghostwriter stage honestly. Add one new Q under
   Getting started: "What's available today?" — the cleanest single place
   the staged model is stated plainly.
6. **App surfaces** (for the record — other chats are executing the actual
   unplugging): the Library mini-spine and Overview stepper already render
   pending stages correctly; unplugged tabs should read "Coming", not
   render dead interiors. The tab strip's existing "Soon" treatment (small-
   caps chip) is the right pattern — Platform Dev applies it to the
   unplugged four.

Estimated size: copy-level edits to five files, no layout changes — hours,
not days, once positioning language is ratified.

## 4 · The offline working environment (design station's requirement)

With stations unplugged in production, design and demo work needs a place
where everything stays plugged in. Recommended pattern (Platform Dev owns
mechanics): a long-lived **`develop` branch with its own Vercel deployment**,
protection ON (the SSO wall that guards previews today), where all tabs
remain live — that becomes the working environment for the composer build,
AL-UX-009, the Klein demo path, and every future station's pre-release work.
Production `main` carries the MVP truth. Feature flags per tab
(`NEXT_PUBLIC_STATION_FLAGS` or a config map) rather than code deletion, so
"unplugging" is a switch, not a fork — and each launch beat is a flag flip
plus a marketing moment, not a merge scramble.

## 5 · What this does NOT change

- **AL-UX-008 / the cover composer** — full speed ahead. The September demo
  runs the full-vision path on the demo account; the composer is publicly
  unplugged but demo-critical. No design change.
- **AL-UX-009** (Publishing/Marketing reskin + Kai rename) — proceeds as
  planned; it now lands on `develop` and waits for its launch beat.
- The Manuscript Room language, tokens, state grammar — unchanged; this memo
  is the state grammar earning its keep at product scale.

## 6 · Open items

1. Marketing ratifies (a)-vs-(b) and the coming-editor naming (§3.3) — this
   station recommends (b) and "name Kai from day one".
2. Paul confirms the "new stages join at no extra cost" pricing line (§3.4).
3. Sequencing: these copy edits should land in the same deploy as Platform
   Dev's tab unplugging — site and product must flip together.
4. Pricing-branch status: if `al-ux-006-pricing-faq` is not yet merged, the
   §3.4–3.5 edits fold into that branch before merge (one deploy, one
   truth); if merged, they're a small follow-up.

— UI/UX Design station
