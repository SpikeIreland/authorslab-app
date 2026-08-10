# The social engine — concept note

**AL-MKT-002 · 2026-07-31**
**From:** Marketing station
**For:** Paul + Carl discussion. No build decision requested now — this note
exists so the idea is designed *before* it's needed, and so near-term choices
don't foreclose it.

## 1 · The idea in one paragraph

A social-media marketing engine that generates on-brand content, runs it
through deterministic review, schedules and publishes it to the platforms a
brand chooses, and measures the results — built as a **discrete product with
brands as tenants**, not as a feature inside AuthorsLab. Kai (AuthorsLab's
marketing station, currently unplugged for a staggered release) becomes a
*skin over this engine* for authors. AuthorsLab-the-company, and the Clarence
lines (Business, Practitioner, Contracts, Academy), are simply additional
tenants. One engine, many brands — including all of ours.

## 2 · Market reality — what's commodity, what isn't

The "generate + schedule + publish" layer is a saturated $20–100/month
market: Buffer/Hootsuite (scheduling), Predis/Ocoya/FeedHive (AI generation
bolted onto posting), Postiz and Mixpost (open-source, self-hostable),
Ayrshare (API-first publishing abstraction). Nobody needs another one.

What the generic tools cannot do is know the business. They produce generic
content because they have no context: no brand system, no claims discipline,
no launch calendar, no knowledge of what the product actually does. **The
differentiator is the context layer, not the posting layer.** This is the
same thesis AuthorsLab is built on — named editors who know your manuscript
vs a generic chatbot — applied one level up: a marketing team that knows
your business vs a caption generator.

## 3 · The spec already exists — we ran it manually

The AL-MKT-001 trial-ad work is the engine's pipeline, executed by hand:

1. **Brand profile in** — palette tokens, typography, voice rules, persona
   system, claims constraints (from the Manuscript Room briefs)
2. **Generate** — copy variants and creative concepts grounded in that profile
3. **Deterministic review** — every claim checked against what is verifiably
   true (no pricing while pricing is unresolved; no turnaround claims while
   the number is unconfirmed; no testimonials that don't exist)
4. **Produce creatives as code** — HTML/CSS from design tokens, rendered to
   PNG; editable, versionable, regenerable in minutes
5. **Publish** — (manual today: Page setup, grid posts, ad campaign)
6. **Measure** — UTM convention, event instrumentation, per-variant results
7. **Feed the narrative** — results update the messaging matrix and the
   investor-facing acquisition story

The engine is this pipeline with tenancy and automation. The manual practice
in the Marketing chat is accumulating the spec — every brief, claims table,
and creative template is future product material.

## 4 · Architecture sketch

- **Tenant = brand profile.** Voice rules, palette/typography tokens, persona
  definitions, claims rules (the deterministic/stochastic bounds, per brand),
  asset library, channel credentials, campaign calendar.
- **Pipeline:** generate → deterministic review → human approve (dial from
  "approve everything" down to "approve nothing" per tenant as trust builds)
  → schedule → publish → ingest metrics → report.
- **Platform adapters:** the publishing layer is *adopted, not built* (§5).
- **Stack:** n8n orchestration + Supabase + Next.js front end — the exact
  substrate AuthorsLab and Clarence already run on. The sacred/shared
  architecture principle applies: the engine is shared infrastructure;
  each tenant's brand profile and content history is sacred to that tenant.
- **SIS principle carries over intact:** stochastic generation, deterministic
  review. Nothing ships externally that isn't defensible on inspection. This
  discipline — rare in the category — is a *feature*, and for regulated
  tenants (Clarence's legal audience) it's the whole ballgame.

## 5 · Build vs adopt

**Adopt:** platform publishing. Meta requires app review for programmatic
posting; X charges for API access; LinkedIn is gated. This is exactly the
moat Ayrshare (paid API) and Postiz (open source, self-hostable) exist to
provide. Candidate path: self-host Postiz (or drive it via its API) behind
our engine, swap later if needed. Fighting Meta app review ourselves is a
side quest with no differentiation payoff.

**Build:** the context layer — brand profiles, claims-rule review, creative-
as-code generation, the campaign/measurement loop. This is where all the
value and all the defensibility live.

## 6 · What it means for AuthorsLab's product line

- Kai ships later as the authors' skin: tenant = the author's book/brand
  (cover palette, genre voice, launch date, retail links), audience =
  readers. The engine underneath is identical to the one running our own
  marketing.
- Release-beat story writes itself: "the marketing station that launches
  your book is the one that launched AuthorsLab."
- Investor angle: the acquisition machine (seed §7) and this engine converge
  — by September the honest line is "our marketing process is systematised
  to the point that it's becoming a product; we run it across five brands."

## 7 · Sequencing — the deliberate answer is *not yet*

The editing-only MVP decision was made precisely to stop half-finishing
platforms. Nothing in the trial ad, the launch, or the September demo needs
this engine. Near-term, only three cheap moves, all already in motion:

1. Keep producing creatives as code from tokens (AL-MKT-001 practice)
2. Formalise the **AuthorsLab brand-profile document** — the first tenant
   record, extracted from the Manuscript Room briefs + claims tables
3. Log every manual marketing run (briefs, claims checks, results) in
   `docs/sis/marketing/` — the engine's requirements doc, written by use

Build trigger to revisit: when Kai's release beat approaches on the staggered
roadmap, or when running 3+ brands' social manually becomes the bottleneck —
whichever comes first.

## 8 · Open questions (for the Paul + Carl conversation)

1. Corporate shape: engine as a Spike Island shared asset serving all
   ventures, vs a product with its own commercial life (sell to other
   businesses beyond ours)? Affects naming, repo, and where its costs sit.
2. If it has its own commercial life eventually: horizontal (any small
   business) or vertical-by-vertical (authors via Kai, legal practitioners
   via Clarence Academy's audience) — vertical is the defensible pattern.
3. Postiz (self-host, AGPL — check licence implications if commercialised)
   vs Ayrshare (paid, clean API, zero maintenance) for the adopted layer.
4. Does the Ghostwriter station's activity-log direction give us the
   content-history model the engine's "measure and learn" loop needs?

— Marketing station
