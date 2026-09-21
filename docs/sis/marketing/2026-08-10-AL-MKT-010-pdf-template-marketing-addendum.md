# Marketing addendum to AL-UX-PDF-01 — CTA layer + corrections

**AL-MKT-010 · 2026-08-10**
**From:** Marketing station
**To:** UI/UX Design chat (travels WITH `2026-08-10-AL-UX-PDF-01-free-analysis-template-brief.md`), cc Platform Dev
**Status:** additive — nothing in the base brief is contradicted except one price-display correction (§4)

## 1 · The free assessment PDF is a marketing asset — design it as one

This document is the single highest-intent artifact we produce: the reader
has uploaded their manuscript, waited for it, and is now reading real
editorial insight about their own book. It is also **portable** — authors
forward things like this to writing-group friends. So the free tier's
template gets a deliberate conversion layer; paid deliverables do not
(Paul's ruling: never upsell a paying member inside their own deliverable).

## 2 · The conversion layer (free tier only)

**2a · Body-page footer, right slot (quiet, every body page):**
one line, sage-deep, linked —
`Continue the journey → authorslab.ai/pricing`
(APITemplate PDFs keep hyperlinks clickable — use real `<a>` tags, not
styled text.)

**2b · Back page (the real asset — add as a final fixed page):**
a calm, full-page close in Manuscript Room language:

- Serif headline: *Every book deserves an editorial team.*
- Two or three lines: what the full journey adds to what they just read —
  Alex chapter-by-chapter, Sam's line edit, Jordan's polish, unlimited
  conversation with all three.
- The offer, one line, per §4 below, linking to /pricing.
- **The forward line** (small, near the foot): *"Reading a friend's copy?
  Get your own free assessment at authorslab.ai/free-analysis."* — the PDF
  travels; make the referral path explicit.
- Wordmark disc + authorslab.ai. No urgency, no exclamation marks, ever.

**2c · UTM discipline — every link in the PDF is tagged** so PDF-driven
conversions stop being invisible:

- Pricing links: `?utm_source=pdf&utm_medium=report&utm_campaign=free-analysis&utm_content=backpage` (footer links: `utm_content=footer`)
- Forward line: `?utm_source=pdf&utm_medium=report&utm_campaign=free-analysis&utm_content=referral`

## 3 · Tier flag in the shared chrome spec

The base brief's §5 ratifies shared PDF chrome for all future templates —
right call. Add one field to `AL-UX-PDF-chrome-v1.md`:

`variant: free | member` — **free** carries §2's conversion layer;
**member** carries clean chrome only (the copyright line's authorslab.ai is
the only URL a paying member's document needs). Ratified once, inherited by
every future template, and no one ever has to re-litigate whether a
line-edit report should carry an ad. It shouldn't.

## 4 · Correction — price display rule (PD-2)

MKT-006 §1 (quoted in the base brief §4) says "Membership from £10/month."
That predates applying PD-2 (*annual price is the headline everywhere —
never a bare monthly price*). The PDF (and the email that carries it)
should read: **"Membership from £7/month, billed annually — authorslab.ai/pricing."**
Marketing will correct MKT-006 to match; UX should build to this line.

## 5 · Small additions while the template is open

- **Cover:** use `{{totalWordCount}}` — "*{{manuscriptTitle}}* · ≈{{totalWordCount}} words" — a small personal detail that signals the whole
  manuscript was actually read. (Variable already in the contract, currently
  unused by the layout.)
- **Sample JSON (§8.3 deliverable):** invented author + book only — never a
  real beta user's name or manuscript title in test data that will sit in a
  template account.
- **Back page counts in "page N of M"** or is excluded consistently —
  UX's call, just be deliberate.

— Marketing station
