# Clarence Legal — brief for AuthorsLab public-page legal content

**AL-CL-BRIEF-001 · 2026-07-30**
**From:** AuthorsLab (via Paul Lyons, co-founder)
**To:** Clarence Legal
**For:** Drafting privacy policy, terms of service, cookie policy, and supporting legal documents for the AuthorsLab website

## 1 · What AuthorsLab is

AuthorsLab is a manuscript-to-launch platform for individual authors. Authors upload their work-in-progress novels, work through developmental, line, and copy editing with named AI editing personas (Alex, Sam, Jordan), then move through publishing preparation (Taylor) and marketing planning (Kai) toward launch. A companion persona (Riley) provides ongoing support across the whole journey.

The product is currently in private preview. Public launch and paid tiers roll out in Q3–Q4 2026. Primary user base is English-language fiction authors of full-length works.

Domain: `authorslab.ai`. Company: [Paul to confirm registered entity name and jurisdiction — likely UK-based given founders' location].

## 2 · What we need drafted

Priority order (top = most urgent for public launch):

1. **Privacy Policy** — how we handle personal data, manuscript content, chat history, and analytics
2. **Terms of Service** — subscriber obligations, our obligations, IP/ownership terms, acceptable use, termination
3. **Cookie Policy** — cookies set by the site + subprocessors
4. **Subprocessor List** — third-party services we route user data through (see §4)
5. **DPA (Data Processing Addendum)** — template for enterprise customers, especially publishers who may sign on later

Nice-to-have (post-launch):

- Acceptable Use Policy (standalone from ToS if useful)
- Copyright infringement / DMCA policy
- Refund policy for paid subscriptions

## 3 · Key facts about how AuthorsLab processes data

Anything drafted needs to accurately reflect the following:

**Data collected from users:**

- Account: name, email, password (hashed via Supabase Auth), optional phone number
- Manuscript content: full text of user-uploaded manuscripts, chapter-by-chapter, along with title, genre, word count, and other metadata the user provides
- Chat history: full transcript of every interaction between the user and any AI persona (Alex, Sam, Jordan, Taylor, Kai, Riley) — retained indefinitely unless user requests deletion
- AI-generated artifacts: developmental notes, line-edit suggestions, copy-edit corrections, cover images, marketing plans, formatted manuscript files — all attached to the user's account
- Payment data: processed by Stripe (we don't store card numbers directly)

**What we do with it:**

- Store all of the above in Supabase (Postgres + Storage buckets, hosted in the EU region — Paul to confirm exact region)
- Pass manuscript excerpts and chat context to Anthropic (Claude models) and OpenAI (DALL-E for covers) via API calls, for the purpose of generating editorial feedback, chat responses, and cover images
- Analytics on aggregate site usage (page views, feature usage) — vendor TBD; likely Vercel Analytics for the near term

**What we don't do:**

- Sell user data
- Use user manuscripts to train AI models (Anthropic and OpenAI API calls are subject to their commercial no-training terms)
- Share manuscript content with anyone outside the author's account, except when the author explicitly invites a named publisher into their project's Design/Publishing/Marketing surfaces (a forthcoming feature; treat as "planned functionality" in drafts)

**Sacred / shared architecture:**

A core product principle — the author's writing space (Library, Author Studio, Riley interactions) is *never* accessible to any third party. Only the design/publishing/marketing surfaces of a specific book can be opened to an invited publisher, and only by the author's explicit action. Privacy policy should reflect this clearly — it's a distinctive positioning that matters commercially as well as legally.

## 4 · Subprocessors to list

Confirmed as of 2026-07-30 (Paul please verify none have changed):

- **Supabase** — database, authentication, file storage
- **Vercel** — application hosting
- **Anthropic** — LLM inference (Claude Sonnet / Opus / Haiku for editorial and companion personas)
- **OpenAI** — DALL-E image generation for book covers
- **n8n Cloud** (`authorslab.app.n8n.cloud`) — workflow orchestration for AI editor pipelines
- **Stripe** — payment processing
- **APITemplate.io** — PDF report generation
- **ConvertAPI** — HTML → DOCX manuscript formatting
- **Resend** (or SMTP provider) — transactional email
- **Cloudflare** — DNS / possibly CDN

## 5 · Voice / style guidance

- **Plain English.** Authors are our audience — writers. Legalese lands badly. Prefer sentences that a novelist would find readable.
- **Warm, direct, honest.** No corporate hedging. Where a policy is generous, say so plainly. Where a limitation exists, name it clearly.
- **Match AuthorsLab's product voice.** If you can, look at any existing marketing copy on `authorslab.ai` (landing page, how-it-works page) for tonal reference. The Manuscript Room / warm serif aesthetic extends to the writing.
- **Bilingual sensitivity.** The imprint we're targeting for our September demo (backed by The Blair Partnership) is Jewish-focused. Nothing in the policies should be culturally insensitive; some drafts may later be adapted for the imprint's own branding.

## 6 · Format for delivery

Please return each policy as a standalone Markdown file, one file per policy, formatted for direct paste into a Next.js public page (headings, paragraphs, ordered/unordered lists). If any policy needs an "effective date" or "last updated" placeholder, use the placeholder token `{{EFFECTIVE_DATE}}` and we'll fill in on publication.

## 7 · Turnaround

Ideally within two weeks so we can integrate copy ahead of the September Jacky Klein demo. Not blocking the demo itself (the demo focuses on product features, not legal pages), but we'd like the public site to be legally complete by demo date.

## 8 · Open questions Paul needs to answer before Clarence starts

- Registered company name and jurisdiction (UK vs Ireland vs elsewhere)
- Supabase region (EU-West preferred but confirm)
- Whether the DPA template should assume UK GDPR, EU GDPR, or both
- Any data-processing contracts already in place with Anthropic/OpenAI/Supabase that should be referenced
- Whether we're VAT-registered (affects refund policy)
- Specific launch date to work backward from, if firmer than "Q3-Q4 2026"

Please raise these as questions in your first response so we can gather answers before you draft.

— AuthorsLab, via Paul Lyons
