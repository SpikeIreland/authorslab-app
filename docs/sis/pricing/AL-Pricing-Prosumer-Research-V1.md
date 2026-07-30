# AuthorsLab Prosumer Bracket Pricing — Research Report V1

**AL-PC-PBR-001 · 2026-07-28 · AL Pricing Chat** · Closes the open question
named in AL-SIS-PRR-001 §7 (prosumer bracket around £19). Method: five
parallel research agents, one per product; primary source = official pricing
page by direct fetch 2026-07-28 (**HIGH**), cross-checked against ≥1
independent 2025–26 source (**MEDIUM** where the official page was silent).
Discrepancies carried explicitly in §5. All prices USD as displayed;
GBP conversion at the V1 convention (£19 ≈ $24).

## 1 · Headline answer

**The bracket does not actually sell at £19.** The two AI-adjacent tools
(ProWritingAid, Grammarly) advertise annual-equivalent prices of **$10–12/mo**
(~£8–10) while charging **$30–36/mo** billed monthly; the craft tools
(Scrivener $59.99, Atticus $147) are one-time; NovelCrafter tops out at
$20/mo *with AI cost externalized to the user's own API key*. So the £19
flagship is **above every neighbour's annual-effective price and below every
neighbour's monthly-billed price**. Two consequences: (a) the billing basis
of "£19" must be decided explicitly — the bracket's universal pattern is a
high monthly anchor with a 60–67% annual discount; (b) £19 cannot be
justified on parity with any single neighbour — it holds only on scope
(five journey phases vs single-function tools), which keeps Sudowrite Pro
($22–29) the true reference point, exactly as AL-SIS-PRR-001 §6 placed it.

## 2 · Verified pricing (fetched 2026-07-28; HIGH unless noted)

| Product | Model | Price | AI metering |
|---|---|---|---|
| **ProWritingAid** | Hybrid: feature-gate at Free→Premium, capacity-metered above | Premium **$30/mo** or **$120/yr** ($10/mo, "save 67%") · Premium Pro $36/mo or $144/yr ($12/mo) · Lifetime $399 / $699 | AI "Sparks" 3/5/50 per **day** by tier; **Chapter Critique 1/day (Premium), 3/day (Pro)**; separate purchasable "Story Credits" (tier discounts 40%/65%); free tier capped 500 words |
| **Grammarly** (now under Superhuman platform branding) | Feature-gated tiers + monthly prompt caps | Pro **$12/mo annual-billed** ($144 upfront) · $30/mo monthly (MEDIUM, 2 sources) · Free $0 | Generative prompts **100/mo free, 2,000/mo Pro** (raised from 1,000), unlimited Enterprise. Business tier discontinued — Pro serves up to 149 seats |
| **NovelCrafter** | Feature-gated subscription + **BYOK** | Scribe $4 · Hobbyist $8 (first AI tier) · Artisan $14 · Specialist $20 /mo; annual = 2 months off | **No AI included at any price** — user pays own OpenAI/Anthropic/OpenRouter token bill on top; subscription buys platform only |
| **Scrivener** | One-time perpetual, per platform | **$59.99** macOS or Windows · $23.99 iOS · bundle $95.98 (MEDIUM) · crossgrade $37.95 · edu −15% | None; no AI, no subscription ("we don't want to add yet another monthly bill" — official). Scrivener 4 neither released nor announced |
| **Atticus** | One-time perpetual, single SKU | **$147**, "no monthly fees, forever"; 30-day refund; lifetime updates | None; no AI features on site or 2024–26 changelog |

## 3 · Shape lessons for AuthorsLab

1. **Nobody sells unmetered AI on a flat prosumer fee.** The bracket's three
   answers: daily/monthly allowances (ProWritingAid, Grammarly), BYOK
   (NovelCrafter), or no AI (Scrivener, Atticus). The credit-allowance
   architecture in the stress-test frame is confirmed as bracket-standard —
   there is no competitor precedent for "unlimited deep analysis" at any
   writer-tier price. (HIGH)
2. **The annual-discount spread is the bracket's biggest lever.** PWA 67%
   ($360→$120), Grammarly 60% ($360→$144), NovelCrafter ~17% (2 months).
   The "£19" decision is really two decisions: the monthly anchor and the
   annual effective price. A £19 monthly / ~£12–13-effective annual
   structure would sit dead-centre in bracket norms. (HIGH)
3. **ProWritingAid's Chapter Critique is the closest metered comparable to
   an AL analysis pass**: 1/day at $10–30/mo, 3/day at $12–36/mo. Any AL
   deep-analysis credit allowance can be benchmarked directly against this
   when sizing tiers — and lmo_ledger will tell us what each pass actually
   costs, which PWA's public pricing cannot. (HIGH)
4. **The one-time band is $59.99–$147** (plus Vellum $249.99, prior report).
   AL's retained per-book pass at $149–299 sits at/above the top of the
   band — defensible on journey scope, but $299 is double Atticus; the
   funnel-pass price point deserves its own test rather than inheriting the
   current $299. (HIGH for band; SYNTHESIS for implication)
5. **Lifetime SKUs exist here** (PWA $399/$699; Scrivener/Atticus are
   lifetime by construction) and writers demonstrably like them — but for a
   metered-COGS product a lifetime SKU is an unhedged liability; PWA hedges
   by keeping AI daily-capped even for lifetime holders. If AL ever offers
   lifetime, the same hedge is mandatory. (MEDIUM/SYNTHESIS)
6. **No per-seat mid-market exists in the bracket.** Grammarly just folded
   Business into Pro; nothing sits between prosumer tiers and enterprise
   sales. Confirms the imprint SKU is a separate motion priced against
   Consonance/Hederis, not an extension of writer tiers. (HIGH)
7. **Price-rise precedent:** PWA raised Premium ~52% ($79→$120/yr) and
   introduced a higher tier (MEDIUM, secondary only); Scrivener rose
   $49→$59.99 in 2022; Grammarly doubled Pro's prompt cap instead of
   cutting price. Raising later is bracket-normal; the Cursor lesson
   (grandfather deliberately) still governs *how*. (MEDIUM)

## 4 · Positioning read for the £19 flagship

£19/mo monthly-billed (~$24) is: above PWA Premium annual ($10) and
Grammarly Pro annual ($12); below PWA/Grammarly monthly ($30); above
NovelCrafter's top tier ($20) — but NovelCrafter + typical BYOK token spend
lands a heavy AI user at a comparable or higher all-in cost with none of the
metering predictability. The honest comparison set for a five-phase platform
remains Sudowrite ($10–44 effective) + one craft tool + one polish tool:
a committed indie replicating AL's scope today stacks roughly
Sudowrite Pro ($22) + Scrivener (~$2/mo amortised) + PWA Premium ($10) ≈
**$34/mo equivalent** — the strongest single argument that £19–24 all-in is
priced *under* the DIY stack. (SYNTHESIS — use in deck.)

## 5 · Discrepancies & caveats (carried honestly)

- **atticus.tech ≠ atticus.io.** A 2025 "Atticus moves to subscription"
  announcement belongs to an unrelated legal-tech product. Any future claim
  that Atticus abandoned one-time pricing should be checked against this
  false positive. (HIGH)
- Scrivener desktop prices are JS-rendered on the store page; $59.99 was
  confirmed on two *other* official L&L pages. Bundle $95.98 and edu $50.99
  are secondary-source (MEDIUM). GBP pricing unverified — L&L quotes USD.
- Grammarly monthly-billed $30 and quarterly $20/mo are secondary-source
  (two agreeing, MEDIUM); the official page shows only the $12 annual rate.
  A demandsage "20% off" coupon was not verified and is likely affiliate.
- NovelCrafter exact annual dollar figures are secondary (MEDIUM) though
  the official "2 months off" mechanism is HIGH and the figures match it.
- One free-tier detail conflict (PWA report runs/day) resolved in favour of
  the official page.
- All prices are US-session USD; regional/VAT treatment unobserved for all
  five. Vendor prices can change; re-verify before the deck ships.

## 6 · Open questions passed forward

Does the flagship's analysis-credit allowance beat PWA's 1/day Chapter
Critique on perceived generosity once lmo_ledger tells us unit cost? Should
the funnel pass reprice below $299 now that the one-time band is verified at
$59.99–$147? Both belong in the financial model + options paper, not here.
