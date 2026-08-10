# AL-UX-PDF-01 · Free-analysis PDF template — brief

**AL-PDC-UX-PDF-01 · 2026-08-10**
**From:** Platform Developer station
**To:** UI/UX Design chat (via Paul as courier)
**Sources:** MKT-006 §1 + §5 · MKT-009 §1 · AL-UX-004 tokens
**Deliverable:** four files (Template HTML, CSS, JSON, Settings) ready to paste into a new APITemplate.io template

## 1 · What this is and why

Paul is migrating AuthorsLab's APITemplate.io templates to a new dedicated account (previous account was dual-use with Clarence Legal, 20-template cap hitting). While migrating, we're rebuilding each template to Manuscript Room. This brief covers the FIRST template: the free-analysis PDF that goes out at the end of the `00.04 Free Manuscript Analysis` n8n workflow.

**Why this template first:** it's the one blocking free-analysis activation on the site. Marketing's trial ad wants to fire; the retrofit workflow is done except for this template + brand mailbox + smoke test.

## 2 · Current state (the thing being replaced)

The existing template is fully pre-pivot. Its Template + CSS + JSON tabs are appended at §7 for reference — read them to understand the shape, then ignore everything about their branding, palette, voice, and offers.

Specifically what NOT to carry over:

- SPIKEISLAND.AI wordmark → AuthorsLab
- Green/red/orange/blue gradients → flat Manuscript Room palette (see §3)
- Emoji (🎉 📊 🚀 ✓) → none
- Exclamation-mark headings → calm serif
- "$399 Complete Author Package" section → new offer per MKT-009 §1 (membership only, no pass)
- "Sarah M., Published Author" testimonial → gone (unverified claim, MKT-009 truth pass)
- `spikeisland.ai/writing-services/author-package` URL → dead, remove entirely
- "Priority Editorial Support" and similar unsubstantiated feature bullets → gone
- Feature-box gradient card, next-steps grid, testimonial-box — all replaceable with Manuscript Room patterns

## 3 · Design system to use (Manuscript Room)

Reference: `docs/sis/design/2026-07-28-AL-UX-004-build-brief-manuscript-room.md` — full token map. Distilled:

- **Backgrounds:** ivory `#FAF8F4`, paper `#FFFFFF`, paper-warm `#FDFBF7`
- **Ink:** charcoal `#2C2C2A` (headings), ink `#2C2C2C` (body), muted `#8A857C` (secondary), faint `#B5AFA4` (tertiary)
- **Accents:** sage `#8FAF8A`, sage-deep `#5C7A6B`, sage-bg `#EFF4EE`, terracotta `#D4956A`, amber-bg `#FDF6EE`
- **Lines:** line `#E8E2D8`, line-soft `#F0EBE2`
- **Display type:** serif stack — `'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif`
- **UI type:** system sans stack
- **Kickers:** 11px, uppercase, letter-spacing 0.14em, muted

Same palette as the site, so the PDF is visually of-a-piece with what an author saw before they uploaded.

## 4 · Content structure per MKT-006 §5 + §1

**Cover / page 1:**

- Ivory field, generous margins (~22 mm)
- Sage-deep wordmark disc + "AuthorsLab" (serif)
- Serif title: "Manuscript Assessment"
- Below in serif italic or lighter weight: *{{manuscriptTitle}}* by {{authorName}}
- Assessment date ({{analysisDate}})
- Thin sage rule
- No header/footer chrome on this page

**Body pages (2+):**

- Standard header + footer per §5
- Section headings numbered in small sage-deep discs (matches the site's stepper number treatment)
- Body prose from `{{reportContent}}` (the workflow injects HTML — Alex's actual analysis text, structured per MKT-006 §1)
- Pull-outs / key recommendations: indented block, 3-4px terracotta left border, subtle paper-warm background
- Line-height generous (~1.6-1.7)

**Final section (Next Steps):**

MKT-006 §1 gives the exact final-section copy. It says (roughly):

> Describe, concretely, what the full developmental edit with Alex goes on to do that this assessment cannot: chapter-by-chapter work, scene-level notes, character arc tracking across the whole book, and revision conversation as you rework. Then present the offer plainly:
>
> - Membership from £10/month at authorslab.ai/pricing.
>
> [MKT-006 §1 originally mentioned the £119 pass; MKT-009 §1 REMOVED the pass, so this section is now membership-only. Do NOT include a pass CTA.]

Never mention: $399, packages, discounts, deadlines, testimonials, "limited availability", "priority" anything unless it's true.

## 5 · Shared PDF chrome (design system extension)

**Ratify this once, apply everywhere.** All future AuthorsLab PDF templates (Alex full-manuscript, Sam line-edit, Jordan copy-edit, Taylor design brief, Publishing checklist, etc.) inherit the same header/footer.

**Header** (every page except cover):
- Left: 8px sage-deep disc + "AuthorsLab" in serif, muted charcoal
- Right: document type in small caps, muted (e.g. "Manuscript Assessment", "Line-edit Report", "Cover Brief")
- Thin sage rule (`#8FAF8A`, 1px) below the row
- Height ~40px

**Footer** (every page including cover):
- Centre: page N of M in small muted (~9pt)
- Below or right: `© 2026 AuthorsLab · a Spike Island Studios company · authorslab.ai` in tiny muted grey (~8pt)
- Optional: manuscript ID (`{{manuscriptId}}`) tiny in left column, for support-request cross-referencing

**Cover exception:** cover carries no header/footer chrome — it's the "cover" of the deliverable and reads better clean.

Document this as `AL-UX-PDF-chrome-v1.md` (or similar) so subsequent templates reference it. This is the PDF-equivalent of `MarketingNav` + `MarketingFooter` for the site.

## 6 · Variable contract (MUST preserve)

The n8n workflow already sends these — do not rename them. Design around them.

```json
{
  "authorName":      "string",
  "manuscriptTitle": "string",
  "analysisDate":    "string",
  "totalWordCount":  "string",
  "reportContent":   "html"
}
```

Also useful (workflow can send; if not present, degrade gracefully): `manuscriptId`, `assessmentDate` (formatted differently from `analysisDate`), `authorEmail`.

If the design wants additional variables (e.g. separate `structuralAnalysis`, `characterAnalysis`, `thematicAnalysis`, `finalSynthesis` blocks instead of one blob `reportContent`), tell me — I'll update the workflow's Final Synthesis Cell contract to emit them. It's a one-shot edit before we activate.

## 7 · Reference — current template files (verbatim, for structural reference only)

### 7.1 · Current Template HTML

```html
[Paste the HTML Paul shared — the SPIKEISLAND.AI one — here for the UX chat's reference]
```

### 7.2 · Current CSS

```css
[Paste the CSS Paul shared]
```

### 7.3 · Current JSON sample

```json
[Paste the JSON Paul shared]
```

### 7.4 · Current Settings

None currently. Header/footer to be added per §5.

## 8 · What Platform Dev needs back

**Four files, one bundle** — same shape Paul uploads to APITemplate.io tab-by-tab:

1. **`free-analysis-template.html`** — full HTML, cover + body, all variables preserved
2. **`free-analysis-styles.css`** — Manuscript Room styling, print-optimised
3. **`free-analysis-sample.json`** — realistic test data (real-sounding author name + book title + Alex prose sample so preview renders like the real thing)
4. **`free-analysis-settings.json`** — page config (A4 portrait, margins) + header + footer HTML per §5

Bonus (recommended): **`AL-UX-PDF-chrome-v1.md`** — the shared header/footer spec extracted so subsequent templates cite one source.

## 9 · Handback path

1. UX chat produces the four files → shares via docs folder or chat inline
2. Paul creates the template in the new APITemplate account, pastes each file into its tab, saves
3. Paul captures the new template ID (16-char hex, like `68777b23605355c4`)
4. Paul hands the ID to Platform Dev
5. Platform Dev swaps the ID into workflow `4GIq7o4cyvk3zCWm` (60-second n8n MCP call)
6. Full smoke test end-to-end once brand mailbox is also live

## 10 · Standing SIS bounds

- **Deterministic:** variable bindings, exact price figures, palette tokens
- **Stochastic:** none in this template (it's a fixed shell — the body content is generated separately by Alex, injected via `reportContent`)
- **No unverifiable claims:** no testimonials, no "priority", no "chosen by hundreds", no turnaround promises until measured

— Platform Developer station
