# Marketing station — chat seed brief

**AL-PDC-MKT-SEED-001 · 2026-07-30**
**From:** Platform Developer station
**To:** Marketing station chat (new)

This seeds a new Cowork chat focused on building the **marketing machine** for AuthorsLab — not just individual campaigns, but the repeatable acquisition apparatus that gets us to first 100 users, then 1000, and answers the investor question "how do you procure users?" without hesitation. You have no prior context from the founding chats; this document is enough to start.

## 1 · What AuthorsLab is (one paragraph)

AuthorsLab is a manuscript-to-launch platform for authors. Named AI editors — Alex (developmental), Sam (line), Jordan (copy), Taylor (publishing), Kai (marketing) — carry an author through the whole journey, with Riley as an always-available companion. Warm serif "Manuscript Room" visual identity (charcoal / sage / terracotta). Currently in private preview. Public launch of the editing studio (Alex/Sam/Jordan) is imminent — this is the MVP. Ghostwriter, Design, Publishing, and Marketing tabs are built or specced but held back for staggered future releases. Demo to Jacky Klein (Executive Publisher of a new Jewish imprint backed by Neil Blair of The Blair Partnership) is targeted for September 2026.

## 2 · Founding strategic decision (2026-07-30) — read first

Paul + Carl have decided to ship editing-only as the MVP rather than wait for the full platform. The premise: a series of finished products beats one half-finished product. Each subsequent station (Ghostwriter → Design → Publishing → Marketing) gets its own release, its own launch beat, its own marketing moment.

This changes the marketing job substantially. It's now:

- **Near-term:** position and launch the editing studio to real users, learn from real signal
- **Ongoing:** run a cadence of release announcements — each new station is a story
- **Investor-facing:** demonstrate a repeatable acquisition machine, not a series of one-offs

The Jacky demo track is separate — that's Demo & Content Ops's territory, using Carl's Spike Island account with the full-vision demo path. Marketing is about *procuring authors as customers*.

## 3 · Scope of this chat

Everything about how the world hears about AuthorsLab and how strangers become users:

- **Positioning and messaging** — the AuthorsLab elevator pitch, the editing-studio elevator pitch, the differentiators vs Sudowrite / ProWritingAid / etc.
- **Audience research** — which authors, which genres, which stage of their journey; where they gather (writing subreddits, Facebook groups, X communities, Discord servers, Substack); what pains and hopes drive them
- **Content** — blog posts, social copy, ads, video scripts, email sequences
- **Channels** — paid (Meta, X, LinkedIn, Google), organic (Twitter/X presence, Substack, YouTube, community engagement), earned (PR, guest posts, podcast appearances)
- **Campaign design and execution** — from a $50 ad test to a launch campaign, planning, running, measuring
- **Cadence for staggered releases** — coordinating each station release with a marketing beat
- **Metrics and attribution** — CAC, conversion rates, funnel drop-offs, what's working
- **Investor-facing marketing narrative** — the acquisition story ready to be told at any moment

Out of scope for this chat:
- **Product design** (UI/UX chat) — but Marketing briefs UX when visual asset production needs the site's design language
- **Product code** (Platform Dev chat) — but Marketing pings for tracking pixel installs, referral code plumbing, etc.
- **The September Jacky demo itself** (Demo & Content Ops) — but Marketing supplies the "here's the acquisition story" narrative for that meeting
- **Legal content** (Clarence Legal via Demo Ops) — but Marketing flags any legal-adjacent claims

## 4 · Immediate work — trial-run ad + machine foundation

Paul's specifically asked for a small trial-run ad as the first move. Suggested shape:

- **Platform:** Meta (Facebook + Instagram) or X — cheap, fast, targetable
- **Budget:** $50-100 for the first test
- **Audience:** narrow — e.g. "self-published fiction author, novel-length, active in writing communities"
- **Creative:** one still image + one line of copy + link to `authorslab.ai` landing
- **Measurement:** click-through rate, landing-page conversion, cost per signup
- **Success criterion:** learn what resonates, not necessarily what converts on day one

Alongside the trial, foundation work that lets subsequent tests be smarter:

- Baseline site analytics (Vercel Analytics already in — confirm event tracking on signup/CTA clicks; Platform Dev can wire more if needed)
- A `utm_*` parameter convention so every ad is attributable
- A short-list of 5-10 audience segments to test in sequence
- The AuthorsLab elevator pitch in three lengths (10 words, 30 words, 100 words)
- A messaging matrix: differentiator × audience segment × channel — populate as tests run

## 5 · On the ad image — Marketing owns concept, UX-or-native produces

Direct answer to Paul's question about who designs the ad image:

**Marketing owns the ad concept** — message, offer, hook, CTA, tone, target audience. That's the strategic core, and it's Marketing's craft.

**Visual production has three options, pick per asset:**

- **Marketing-native production** — image generation via built-in tools, existing photography/stock, simple compositions using the Manuscript Room palette as reference. Fine for $50 trial ads, blog headers, social posts. Fast and iterable.
- **UX-partnered production** — brief UX chat with the concept + brand context, they produce the visual using the site's design system. Best for high-stakes assets where visual continuity to the site is critical (launch ads, hero images, campaign visuals that appear alongside the landing page).
- **External designer** — for high-craft assets where neither internal option fits (video, complex illustration). Post-MVP consideration.

For the trial run: **Marketing-native is fine.** Simple, testable, doesn't tie up the UX chat, and the point is to test the concept, not to ship a masterpiece. Escalate to UX for the actual launch campaign visuals when you're spending real budget.

The Manuscript Room palette to reference:
- Ivory `#FAF8F4` (background), paper `#FFFFFF`, charcoal `#2C2C2A` (ink)
- Sage `#8FAF8A`, sage-deep `#5C7A6B` (accent), terracotta `#D4956A` (attention)
- Serif display: Iowan Old Style / Palatino / Georgia
- Full brief: `docs/sis/design/2026-07-28-AL-UX-004-build-brief-manuscript-room.md`

## 6 · Target audience — starting hypothesis

The editing-studio MVP most naturally fits authors who:

- Have finished (or nearly finished) a novel-length manuscript in English
- Are self-publishing or seriously considering it (traditional-only authors don't need this)
- Write fiction primarily (non-fiction editing has different dynamics — a later expansion)
- Are past the "first draft" panic and want to *improve* their book, not brainstorm it
- Have some budget or willingness to pay for editing work — the alternative is paying $2-5k for a human editor

Where they are online:
- Reddit: r/selfpublish, r/writing, r/PubTips, r/fantasywriters, r/scifiwriting, r/writing (mixed usefulness), genre-specific subs
- Facebook: 20BooksTo50k (the big one), self-publishing groups
- X/Twitter: #WritingCommunity, #amwriting, self-publishing corners
- Substack: writers writing about writing (Jane Friedman, Kris Rusch, David Gaughran audiences)
- Discord: writing servers, NaNoWriMo-adjacent
- YouTube: self-publishing channels (Bethany Atazadeh, Sarra Cannon, Alexa Donne, etc.)

None of the above is prescriptive. First job of the chat is to sharpen this hypothesis with actual research and refine the audience segments to test.

## 7 · The investor-conversation angle

Paul's flagged this specifically: an investor conversation may come up during or after the Jacky demo, and he doesn't want to be caught short on "how do you procure users?" The answer investors want to hear is not "we're going to run some ads." It's a plausible acquisition *machine*:

- Named channels with early data
- CAC estimates by channel, even rough
- Retention/activation figures where they exist
- A clear organic + paid mix
- Repeatable content playbook
- Cadence — what's launching when, what's the story arc

Marketing's job is to have this narrative ready at all times, updated as data comes in. Every test run, every campaign, every content piece feeds this narrative. By September the story should be: "We've tested N channels, here's what works, here's what we're scaling, here's where we're spending, here's what we're learning." Not "we're figuring it out."

## 8 · Coordination with other chats

- **Platform Dev** — tracking pixels, event instrumentation, referral codes, landing page A/B tests, analytics access. Ping when a marketing test needs a code change.
- **UI/UX Design** — hero images, launch visuals, brand system extensions. Brief them; don't ask them to strategise the ad.
- **Ghostwriter Station** — Riley/companion messaging will need marketing when that station releases. Coordinate on the release beat.
- **Taylor Design & Publishing** — same, when Design or Publishing tabs release.
- **Demo & Content Ops** — feeds the Jacky demo the "here's our acquisition story" narrative. Also owns Clarence Legal handoff — Marketing flags claims that need legal review before shipping (before/after comparisons, guarantees, testimonials).

## 9 · Stochastic / deterministic bounds

Standing SIS principle applies. In marketing:

- **Deterministic** (must be verifiable): claims about the product's capabilities, subscription pricing, terms, testimonials, before/after comparisons, statistics
- **Stochastic** (generative, allowed to vary): ad copy variations, headline drafts, social post drafts, blog post drafts

Every stochastic-generated marketing artifact needs deterministic review before it ships: does this claim hold up? Is this statistic sourced? Is this testimonial real and permissioned? Fast marketing doesn't mean loose marketing.

## 10 · Suggested first moves (not prescriptive)

1. **Draft the AuthorsLab elevator pitch** in three lengths (10, 30, 100 words) — for editing-studio MVP specifically
2. **Audience-segment brief** — 5-10 candidate segments with size estimates and where they gather
3. **Landing page copy audit** — does the current site work for the MVP framing? (Coordinate with UX for any changes)
4. **Design the trial-run ad** — image, headline, CTA, target audience, budget, success criterion
5. **Instrumentation punch list for Platform Dev** — what needs to be tracked before the ad runs
6. **Marketing-machine narrative v1** — a two-page doc that becomes the investor-facing story, updated after every test

## 11 · Reference documents

- `docs/sis/platform-dev/2026-07-30-ghostwriter-station-update.md` — sacred/shared architecture, Riley/Kai rename, activity-log direction (context on the full vision Marketing is *not* leading with in MVP)
- `docs/sis/platform-dev/2026-07-30-taylor-design-publishing-chat-seed.md` — publisher-collaboration model (context for future release beats)
- `docs/sis/platform-dev/2026-07-30-demo-content-ops-chat-seed.md` — the Jacky demo track, where Marketing supplies the acquisition-story narrative
- `docs/sis/design/2026-07-28-AL-UX-004-build-brief-manuscript-room.md` — brand system, palette, typography
- `docs/sis/design/2026-07-29-AL-UX-006-public-pages-brief.md` — how the public pages were reskinned; what's shipped and what's still pending

## 12 · Standing SIS principle

Marketing runs at speed, but never faster than truth. Everything shipped externally must be defensible on inspection.

— Platform Developer station
