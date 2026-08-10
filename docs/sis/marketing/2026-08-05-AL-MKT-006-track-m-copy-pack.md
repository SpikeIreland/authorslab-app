# Track M copy pack — free-analysis retrofit content + decisions record

**AL-MKT-006 · 2026-08-05**
**From:** Marketing station
**To:** Platform Dev (apply via n8n MCP), Pricing Chat (one ratification),
UI/UX (one small request), Paul (APITemplate.io template per §5)
**Re:** AL-PDC-MKT-005-RESP Track M deliverables + the three §3/§4/§6 decisions

## 0 · Decisions (Paul, 2026-08-05)

1. **Free-analysis scope = Option A, whole manuscript.** Economics reviewed
   after the first 100 analyses via the ledger; downgrade only if costs bite.
2. **Trial ad runs NOW, destination = landing page `/`** (Platform Dev's
   option b). The pass-led second test aligns with free-analysis activation.
   **Request to UI/UX + Platform Dev:** until activation, soften/de-emphasise
   the free-assessment CTAs sitewide (e.g. "Free assessment — opening this
   week" state or route them to signup) so paid visitors don't reach a form
   that errors. Marketing will not send traffic to a dead form.
3. **£119 pass = full journey** (Alex + Sam + Jordan on one manuscript) —
   matches the July pricing decision. **Pricing Chat: please ratify in one
   line and correct the Stripe `passes_per_month` metadata** (or document
   that the field means something else). Pass-led copy waits on this line.
4. `station_id`: single value **`alex.free-analysis`** is sufficient for the
   economics view — per-stage split not needed.

AL-MKT-001 brief updated to v4 alongside this doc (destination + gates).

---

## 1 · Final Synthesis prompt — replacement positioning block

Platform Dev: replace the current "CRITICAL: FREE SAMPLE… $399 Author
Package" block and the sample-positioning language wholesale with:

```
**WHAT THIS IS:**
A complete, free developmental assessment of the author's full manuscript.
It is a real deliverable, not a teaser — give genuine, specific value the
author can act on today. Generosity is the strategy.

**VOICE:**
- Write directly TO the author: "you", "your manuscript", "your story"
- Calm, concrete, editorially confident. Encouraging AND honest — praise
  what earns it, name the real problems kindly and specifically
- No hype, no exclamation marks, no urgency or scarcity language
- Never call this a "sample" or "preview"; it is an assessment
- Reference specific characters, scenes and details from THIS manuscript —
  the author must feel the book was actually read

**STRUCTURE:**
1. Your manuscript at a glance — genre positioning, overall assessment,
   what is fundamentally working
2. Structure — the 2-3 most important structural observations
3. Characters — presence, voice, arcs; the strongest element and the
   biggest opportunity
4. Themes — what the manuscript is really about, and how consistently it
   delivers that
5. Your priorities — the 3 highest-impact things to address, in order
6. What a full edit would add (see NEXT STEPS)

**NEXT STEPS SECTION (final section only — no prices anywhere else):**
Describe, concretely, what the full developmental edit with Alex goes on to
do that this assessment cannot: chapter-by-chapter work, scene-level notes,
character arc tracking across the whole book, and revision conversation as
you rework. Then present exactly two options, plainly:
- Single-Project Pass — £119 one-time: the full editorial journey (Alex,
  Sam and Jordan) on this manuscript. No subscription.
- Membership — from £10/month at authorslab.ai/pricing.
If they buy a pass and subscribe within 90 days, £13 is credited toward
their first month.
Never mention: $399, packages, discounts, deadlines, limited availability.
```

## 2 · Delivery email — replacement copy

**From:** AuthorsLab `hello@authorslab.ai` (pending mailbox)
**Subject (primary):** Alex's assessment of "{{bookTitle}}"
**Subject (alternates):** Your manuscript assessment — {{bookTitle}} ·
What we found in "{{bookTitle}}"

Plain, warm HTML in the Manuscript Room language — ivory background
`#FAF8F4`, charcoal text `#2C2C2A`, serif headings (Palatino/Georgia stack),
sage-deep `#5C7A6B` for the single CTA link. No gradients, no emoji, no
banner imagery.

> Dear {{authorName}},
>
> Thank you for sharing *{{bookTitle}}* with us.
>
> Alex — our developmental editor — has read your manuscript in full. Your
> assessment is attached: structure, characters, themes, and the three
> things that would most improve the book, in order.
>
> It's yours to use however you like. If you'd like to go further, the full
> editorial journey takes *{{bookTitle}}* through Alex's complete
> developmental edit, Sam's line edit, and Jordan's final polish — as a
> one-time Single-Project Pass (£119, no subscription) or with membership
> from £10/month. Details at authorslab.ai/pricing.
>
> Whatever you decide — keep going. The manuscript is further along than
> most that never get finished.
>
> — The AuthorsLab team
>
> AuthorsLab · a Spike Island Studios company · authorslab.ai

(Footer adds the standard unsubscribe/contact line once legal pages exist.)

## 3 · Webhook response — replacement copy

```json
{
  "status": "success",
  "message": "Thank you — Alex is reading \"{{bookTitle}}\" now. Your assessment will be emailed to {{authorEmail}} when it's ready.",
  "submissionId": "{{submissionId}}",
  "bookTitle": "{{bookTitle}}"
}
```

Drop the "within the next few minutes" promise until the retrofit's real
turnaround is measured in the smoke test; if it reliably lands under ~10
minutes, the on-page copy (not the API string) can say "usually within
minutes." Page copy pass comes with the Ask-2 truth confirmation.

## 4 · Error-state copy (page-side, for the fixed catch block)

> Something went wrong on our side and your manuscript didn't reach us.
> Please try again in a few minutes — or email it to hello@authorslab.ai
> and we'll run the assessment by hand.

(Only ship the second clause once the mailbox exists.)

## 5 · APITemplate.io PDF template — content brief (for Paul or UI/UX)

- **Format:** A4 portrait, single column, generous margins (~22mm)
- **Cover block:** ivory field; sage-deep disc wordmark + "AuthorsLab";
  title "Manuscript Assessment"; then *{{bookTitle}}* by {{authorName}},
  assessment date; thin sage rule
- **Type:** serif display for headings (Palatino/Georgia class), clean sans
  for body-adjacent labels; body text charcoal `#2C2C2A` on white/ivory
- **Section headings:** numbered in small serif discs (sage), matching the
  site's FAQ/category pattern
- **Pull-out styling:** key recommendations as indented blocks with a
  terracotta left rule — the "margin note" motif from the ad creatives
- **Footer each page:** "© 2026 AuthorsLab · a Spike Island Studios
  company · authorslab.ai" small, muted
- **No:** gradients, emoji, stock imagery, star ratings
- Existing reference: `creatives/` PNGs in `docs/sis/marketing/` carry the
  exact palette and type feel; `AL-UX-004` brief is the canonical token doc

## 6 · Claims check on everything above

| Claim | Status |
|---|---|
| "Read your manuscript in full" | ✔ contingent on Option A retrofit — do not ship this copy with a 3-chapter workflow |
| £119 = full journey (Alex+Sam+Jordan, one manuscript) | ⚑ pending Pricing Chat's one-line ratification (§0.3) |
| £13 bridge credit within 90 days | ✔ per pricing launch note §3 |
| "From £10/month" | ✔ Starter monthly |
| No turnaround promise anywhere | ✔ deliberately absent until smoke-test data exists |
| Founding £9.50 | ✔ absent, as always |

— Marketing station
