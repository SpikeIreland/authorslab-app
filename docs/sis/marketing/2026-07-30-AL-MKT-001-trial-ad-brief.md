# Trial-run ad — brief, creatives, measurement

**AL-MKT-001 · 2026-07-30**
**From:** Marketing station
**Status:** Ready for Paul's review. Blocked on two launch gates (§8) before spend.

The first move of the acquisition machine: a small paid test whose job is to
*learn what resonates*, not to convert on day one. Everything here follows the
standing SIS principle — no claim ships that isn't defensible on inspection.

---

## 1 · Objective and success criterion

- **Objective:** first read on message resonance and channel viability for the
  editing-studio MVP. Which hook earns the click from self-publishing novelists?
- **Success criterion (per seed brief):** learning, not revenue. Concretely:
  a winning copy/creative variant identified with ≥2x the CTR of the losers,
  and a first baseline for cost-per-click and cost-per-assessment-start.
- **Explicit non-goals:** positive ROAS, signup volume, brand reach.

## 2 · Platform, budget, structure

- **Platform:** Meta (Facebook + Instagram feeds only — no Audience Network,
  no Stories/Reels placements for v1; square creative, controlled context).
  Rationale vs X: far finer interest targeting for writing/self-publishing
  audiences at small budgets, and better creative QA tooling.
- **Budget:** **$75 total — $15/day × 5 days** (mid-point of the $50–100 seed
  range; enough for ~3,000–5,000 impressions per variant at typical niche CPMs).
- **Campaign objective:** Traffic (link clicks). Conversion objectives need
  pixel + event volume we don't have yet; Traffic buys the cleanest learning.
- **Structure:** 1 campaign → 1 ad set (single audience, §3) → 3 ads
  (variants A/B/C, §4). Meta splits budget dynamically; check daily that no
  variant is starved (<20% of impressions) — if one is, pause the runaway
  leader for 24h to force rotation.

## 3 · Audience (v1 — segment `selfpub-uk-01`)

> **Revised 2026-08-05 (Paul's decision, per AL-PDC-MKT-PRICING-001):** UK
> only — pricing is live in £ GBP, UK-first. Budget restated as **£60 total,
> £12/day × 5 days**. Non-UK English segments queue behind the
> multi-currency decision. `utm_term=selfpub-uk-01`.

Per the seed's starting hypothesis, deliberately narrow:

- **Geo:** UK only (was US/UK/CA/AU — superseded, see above)
- **Age:** 28–65 · all genders
- **Interest targeting (OR within group):** Self-publishing · Amazon Kindle
  Direct Publishing · NaNoWriMo · Scrivener · Creative writing
- **Narrow by (AND):** Engaged shoppers OR "Fiction books" interest, if
  audience size stays above ~500k after narrowing; otherwise skip the AND.
- **Exclusions:** none for v1 (no customer lists yet worth excluding)
- Advantage+ audience expansion **off** — a widened audience destroys the
  learning value of a narrow test.

Future segments to test in sequence (feed the segment shortlist doc):
finished-first-draft NaNo crowd · 20BooksTo50k-style rapid-release indies ·
querying authors burned out on agents · genre-specific (romance, fantasy).

## 4 · Copy variants

> **Test-1 revision (2026-08-05):** destination is `/` and the assessment
> offer is off the table until activation. For test 1: run **A + B only**,
> with final sentence of each primary text replaced by "Start your book at
> authorslab.ai." and Description = "authorslab.ai". Creatives
> `ad-a-editorial-team-test1.png` / `ad-b-now-edit-it-test1.png` carry a
> "Start your book" pill (matches the landing CTA verbatim). **Variant C is
> reserved for test 2** — its entire concept is the free assessment.

All three route to the same destination (§5). Voice per AL-UX-006: calm,
concrete, editorially confident; no exclamation urgency, no scarcity.

### Variant A — `ad-a-editorial-team` (message match with landing hero)

- **Primary text:** You've finished the manuscript. Now it needs an editorial
  team. Meet Alex, Sam and Jordan — AI editors who work through your novel
  with you, from first read to final polish. Start with a free manuscript
  assessment.
- **Headline:** Every book deserves an editorial team.
- **Description:** Free manuscript assessment
- **CTA button:** Learn More

### Variant B — `ad-b-now-edit-it` (pain hook: the post-draft gap)

- **Primary text:** The draft is done. What your novel needs now isn't another
  writing app — it's an edit. AuthorsLab is an editorial team for finished
  manuscripts: developmental, line and copy, with named editors who know your
  book. See what they'd say about yours, free.
- **Headline:** You finished the novel. Now edit it.
- **Description:** Developmental · line · copy
- **CTA button:** Learn More

### Variant C — `ad-c-editor-margin` (curiosity: the assessment itself)

- **Primary text:** Self-publishing means you're the publisher — editorial
  department included. AuthorsLab gives your finished manuscript named AI
  editors who read your chapters and work through them with you. Upload your
  manuscript and get a free assessment.
- **Headline:** What would an editor say about your novel?
- **Description:** Free manuscript assessment
- **CTA button:** Sign Up

## 5 · Destination and message match

- **Destination — REVISED 2026-08-05 (Paul, per AL-PDC-MKT-005-RESP §6b):**
  test 1 runs NOW against the landing page
  `https://authorslab.ai/` — free-analysis is ~10–14 days from public-ready,
  and test 1 measures message resonance, which the landing carries. Test 2
  (pass-led variant) points at `/free-analysis` once activated. Condition:
  free-assessment CTAs on-site are softened/rerouted until activation so paid
  visitors never hit a dead form (request logged in AL-MKT-006 §0.2).
  Ad copy CTA lines referencing "free manuscript assessment" swap to
  "Learn more at authorslab.ai" phrasing for test 1 — creative pills on the
  three images likewise superseded for test 1 (text overlay update, minutes
  per file) OR run test 1 with variant B creative only (no assessment pill).
- Landing hero "Every book deserves an editorial team." is echoed verbatim in
  variant A — strongest scent-trail; variants B and C test alternative hooks
  against the same destination.
- **Production check (2026-07-31):** the live site still serves the pre-pivot
  identity — hero "From Raw Manuscript to Published Book", $299 one-off, five
  phases, Quinn, the "$2,000–$10,000+" cost anchor, no privacy/terms links.
  The AL-UX-006 rewrite is not deployed yet. Ads written for the MVP framing
  would land on copy that contradicts them → launch gate 8.3.

## 6 · Creative

Marketing-native production per the seed (§5): three 1:1 images, 2160×2160 px
PNG, Manuscript Room palette and serif display (TeX Gyre Pagella — the
Palatino-class face from the brand's fallback stack). Files in
`docs/sis/marketing/creatives/` with editable HTML sources for iteration:

| File | Concept |
|---|---|
| `ad-a-editorial-team.png` | Book-object collage + landing hero line + persona discs A/S/J |
| `ad-b-now-edit-it.png` | Dark typographic: "You finished the novel. / Now edit it." |
| `ad-c-editor-margin.png` | Manuscript page with an Alex margin note + "What would an editor say?" |

Production note on C: the margin note ("This is where your story truly
begins…") is an **illustrative depiction of product-style feedback**, not a
quote from a real session or a testimonial. It must remain representative of
what Alex actually produces; if the product wouldn't plausibly say it, we
change the ad, not the claim. Escalate to UX-partnered production for launch-
campaign visuals when real budget is committed.

## 7 · Measurement

### UTM convention (machine-wide standard from today)

`utm_source` = platform (`meta`, `x`, `google`, `reddit`, `substack`, `newsletter`)
`utm_medium` = buying mode (`paid-social`, `cpc`, `organic-social`, `email`, `referral`)
`utm_campaign` = `YYYYMM-<initiative>-<seq>` → this test: `202608-trial-01`
`utm_content` = creative/copy variant → `ad-a-editorial-team`, `ad-b-now-edit-it`, `ad-c-editor-margin`
`utm_term` = audience segment → `selfpub-en-01`

Example final URL:
`https://authorslab.ai/free-analysis?utm_source=meta&utm_medium=paid-social&utm_campaign=202608-trial-01&utm_content=ad-a-editorial-team&utm_term=selfpub-en-01`

### Metrics captured

| Metric | Source | Note |
|---|---|---|
| Impressions, CPM, CTR, CPC per variant | Meta Ads Manager | The primary read for a Traffic test |
| Landing sessions by utm_content | Vercel Analytics | Cross-check Meta clicks vs real sessions (expect 10–30% loss) |
| Assessment form starts + submits | Vercel custom events (§8) | The true "did the message land" signal |
| Cost per assessment submit | derived | First CAC-adjacent number for the investor narrative |

### Reference benchmarks (for reading results, not as pass/fail)

Meta all-industry averages run ~1% CTR and ~$0.5–1.5 CPC for traffic
campaigns; niche interest audiences often beat that when the creative speaks
their language. Read the *spread between variants* first, absolute numbers
second. A variant at 2%+ CTR is a keeper; under 0.5% across the board means
the message (or audience) is wrong, which is also a result.

## 8 · Launch gates — do not spend until cleared

1. **Free-analysis false-success bug** (found in the AL-UX-006 audit: the
   submit `catch` shows the success screen on webhook failure). Paying to send
   strangers into a form that can silently fail corrupts both the data and the
   first impression. → Platform Dev, blocker.
2. **Privacy policy + terms pages exist and are linked.** The site currently
   has neither while collecting PII (AL-UX-006 §5; confirmed live 2026-07-31);
   Meta's ad policies require a privacy policy on landing pages collecting
   personal data, and it's a Clarence Legal flag regardless. → Paul / Clarence
   via Demo Ops, blocker.
3. **AL-UX-006 landing + free-analysis pages deployed to production.**
   Confirmed 2026-07-31: production still serves the old identity ($299
   one-off, five phases, Quinn, stale cost anchors). Running MVP-framed ads
   into that page wastes the spend and confuses the exact users we most want
   to learn from. Minimum deploy: chrome + landing + `/free-analysis`
   (AL-UX-006 phasing 1–2 plus the free-analysis restyle). → Platform Dev,
   blocker.
4. **Meta business infrastructure exists** — Page + IG ✅ done 2026-07-31;
   business portfolio + ad account remain (Appendix A). **Currency decision
   resolved 2026-08-05: GBP** — pricing launched £-first on a dedicated
   AuthorsLab Stripe account, which settles it.
5. **Free-analysis funnel ACTIVATED.** Per AL-PDC-MKT-PRICING-001 §4 the
   funnel is currently inactive; Marketing decision (Paul, 2026-08-05):
   free analysis IS the primary top-of-funnel — Platform Dev to activate in
   R1 (launch-checklist item 6). The ad's destination doesn't exist as a
   working funnel until this ships. → Platform Dev, blocker.

### Instrumentation punch list → Platform Dev (request doc to follow)

- Vercel Analytics custom events: `assessment_start`, `assessment_submit`,
  `signup_start`, `signup_complete`, `cta_click` (nav "Start your book")
- UTM params persisted through the assessment → signup flow (sessionStorage or
  pass-through), so a later signup is attributable to the ad click
- Confirm `/free-analysis` real turnaround + accepted formats (truth-table
  §1.6–1.7) — the ad makes no claim about either, and must stay that way until
  the numbers are confirmed
- Meta Pixel: **deferred** for v1 (avoids consent complexity before the legal
  pages exist). Revisit for the launch campaign alongside a consent banner.

## 9 · Deterministic claims check (per SIS bounds)

| Claim in copy | Status |
|---|---|
| Named AI editors Alex / Sam / Jordan; developmental, line and copy | ✔ true, shipping MVP scope |
| "Work through your novel with you, first read to final polish" | ✔ matches app journey labels |
| Free manuscript assessment exists | ✔ live lead offer — contingent on gate 8.1 fix |
| "AI editors" framing | ✔ honest — copy never implies human editors |
| Pricing | ✘ absent from ads **by choice** (Paul, 2026-08-05). Figures are now real (Starter £10 / Author £19 / Pro £39 / Pass £119, per AL-PDC-MKT-PRICING-001) and MAY be used in future variants; the £9.50 founding price is never published anywhere. First test stays free-analysis-led, no figures |
| Held-back stations (design/publishing/marketing tools) | ✘ ads say *editing* only — "coming soon" labels are load-bearing; never imply the rest is live |
| Turnaround time | ✘ deliberately absent (truth-table §1.6 unresolved) |
| Testimonials / social proof | ✘ deliberately absent (none exist; founding story stays on-site) |
| Cost comparison vs human editing ($2–5k) | ✘ withheld from ads until we source it properly |

## 10 · Run checklist

1. Clear all four launch gates (§8)
2. Paul: confirm variant copy + creatives (or edit — HTML sources iterate in minutes)
3. Build campaign in Meta Ads Manager per §2–§5 (accounts per Appendix A)
4. QA: click every ad preview → correct URL with correct UTMs → form works
5. Run 5 days; check daily for variant starvation (§2); no mid-flight edits otherwise
6. Day 6: results memo → feeds the messaging matrix, segment shortlist, and
   **marketing-machine narrative v1** ("we've tested Meta against segment
   `selfpub-en-01`; here's the winning message and our first cost baselines")

## 11 · What this feeds

Every number lands in the investor-facing acquisition narrative (seed §7):
channel tested, CPC/CTR baselines, cost per assessment, winning message.
Test 2 candidates (pick after results): same creative on X for channel
comparison · same channel with segment #2 · winning variant with budget
scaled 3x to check stability.

---

## Appendix A · Meta business infrastructure setup (none exists — 2026-07-31)

Order matters; each step needs the one before it. Total active time ~1–2
hours; domain verification and any business-verification prompts can add a
day or two of waiting.

1. **Facebook Page** — ✅ DONE 2026-07-31: Page "AuthorsLab" created
   (Software / Product/Service), sage-disc avatar + Manuscript Room cover
   applied (`creatives/fb-profile-wordmark.png`,
   `creatives/fb-cover-manuscript-room.png`), bio set.
2. **Instagram account** — ✅ DONE 2026-07-31: handle **@authorslab.ai**
   secured. Created against Paul's personal email (brand mailboxes don't
   exist yet) — **follow-up: swap account email to `hello@authorslab.ai`
   once mail forwarding is set up** (Platform Dev: Cloudflare Email Routing
   or registrar forwarding on the authorslab.ai domain). Business account
   type, Facebook Page link, avatar + bio + website all ✅ DONE 2026-07-31.
   Remaining: 3–6 grid posts before ads run (three ad creatives + editor
   tiles in `creatives/`) so the profile doesn't look abandoned.
3. **Business portfolio** — at business.facebook.com create the portfolio
   (name: Spike Island Studios or AuthorsLab — Paul's call; portfolio name is
   mostly internal). Claim the Page and IG account into it.
4. **Ad account** — create inside the portfolio. **Currency and timezone are
   permanent per ad account.** Decision for Paul: GBP (matches the financial
   model and likely billing entity) vs USD (matches benchmark literature) vs
   AUD. Recommendation: GBP, and convert benchmarks — consistency with the
   September investor numbers beats convenience. Timezone: Australia/Perth.
   Add payment method.
5. **Domain verification** — verify `authorslab.ai` in Business settings →
   Brand safety (DNS TXT record or meta-tag; Platform Dev can add either in
   minutes). Needed for link-ad credibility and any future pixel/Conversions
   API work.
6. **Two-factor + roles** — 2FA on everything; add Carl (or a second trusted
   admin) so the portfolio isn't single-point-of-failure on one profile.
7. **Skip for v1:** Meta Pixel / Conversions API (per §8 punch list — wait for
   legal pages + consent), Meta business verification (only if Meta demands
   it), Instagram Shopping, WhatsApp.

— Marketing station
