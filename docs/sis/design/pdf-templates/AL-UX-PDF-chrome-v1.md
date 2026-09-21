# AL-UX-PDF-chrome-v1 — shared chrome for every AuthorsLab PDF

**2026-08-10 · UI/UX Design station · Ratified with AL-UX-PDF-01**
Every AuthorsLab PDF template (free assessment, Alex full-manuscript, Sam
line-edit, Jordan copy-edit, Taylor design brief, publishing checklist, …)
inherits this. Templates cite this file; nobody re-litigates chrome per
template. This is the PDF equivalent of `MarketingNav` + `MarketingFooter`.

## 1 · Tokens

Manuscript Room (AL-UX-004): ivory `#FAF8F4` page field, paper `#FFFFFF`
cards, charcoal `#2C2C2A` display ink, ink `#2C2C2C` body, muted `#8A857C`,
faint `#B5AFA4`, line `#E8E2D8`, sage `#8FAF8A`, sage-deep `#5C7A6B`,
terracotta `#D4956A` (pull-out accents). Serif display: Iowan Old Style /
Palatino / Georgia. Sans: system stack. Kickers 8pt / 0.14em / uppercase /
muted. No gradients, no emoji, no exclamation-mark headings — ever.

## 2 · Header & footer

**Header** (body pages): left — 8px sage-deep square disc + "AuthorsLab" in
serif, muted; right — document type in 7pt small caps ("Manuscript
Assessment", "Line-edit Report", "Cover Brief"); 1px sage rule beneath.
**Footer** (every page): centre — "Page N of M" 7pt faint; beneath —
"© 2026 AuthorsLab · a Spike Island Studios company · authorslab.ai" 6.5pt,
plus the manuscript/document ID for support cross-referencing.

Header/footer HTML lives in each template's Settings tab with **inline
styles** (external CSS doesn't reach chromium print chrome). Canonical
markup: see `free-analysis-settings.json` — copy, change the document-type
string, done.

## 3 · The variant flag (per AL-MKT-010 §3)

`variant: free | member`

- **free** — carries the conversion layer: footer right slot
  "Continue the journey → authorslab.ai/pricing" (linked, UTM-tagged) and a
  full back page (serif headline, journey lines, PD-2-compliant offer, the
  forward/referral line, wordmark). The free assessment is the only current
  free-variant template.
- **member** — clean chrome only. The copyright line's authorslab.ai is the
  only URL a paying member's document needs. **Never upsell a paying member
  inside their own deliverable** (Paul's ruling, AL-MKT-010 §1).

Every link in any free-variant PDF is UTM-tagged:
`utm_source=pdf & utm_medium=report & utm_campaign=<template> &
utm_content=<footer|nextsteps|backpage|referral>`.

## 4 · Cover convention

Covers carry no header (and ideally no footer): ivory field, brand disc +
serif wordmark top-left, serif document title, book title in italic serif,
author, date, thin sage rule, ≈22mm margins. If the platform can't suppress
chrome on page 1, the 8pt muted header is the accepted fallback — quiet
enough not to fight the cover.

## 5 · Body conventions

Numbered section headings with sage-deep discs (mirrors the site's stepper);
pull-outs/key recommendations as terracotta-left-border blocks on paper-warm;
line-height ≥1.6; `page-break-after: avoid` on headings,
`page-break-inside: avoid` on pull-outs and closing cards. Prices in PDFs
follow **PD-2**: annual price is the headline, never a bare monthly figure —
current canonical line: "Membership from £7/month, billed annually —
authorslab.ai/pricing".

## 6 · Sample-data rule

Template sample JSON uses invented authors and titles only — never a real
beta user's name or manuscript (AL-MKT-010 §5). Current canonical sample:
Eleanor Marsh, *The Cartographer's Daughter*.

— UI/UX Design station
