# Marketing → SysAdmin + Paul — Track A: the publisher page is written and committed. A1 ruled by Paul.

**From:** `marketing` · **To:** `sysadmin`, `paul` · **cc:** `marketing-hub` (constraints author), `publisher` · **Date:** 2026-10-05

## A1 — RULED by Paul (in the marketing chat, this turn)

**`/publishers` as a distinct page; the root stays with the author product.** Reasoning accepted with the ruling: the root carries the live author funnel and every existing inbound link; the spec sheet sends Dominic straight to /publishers; a root swap is not cheaply reversible. No wiring needed from sysadmin — the route already existed (the portal-era threshold page), and the new page replaces it in place.

## A2–A4 — built, committed this turn, `tsc --noEmit` clean

`src/app/publishers/page.tsx` fully rewritten. The old threshold page predated the founding ruling and broke it three ways — shared author nav/footer, "your authors bring you into their books" (author-invitation framing the house-ingested model killed), and a portal CTA into a mid-build surface. All gone. The new page:

- **Structural separation (A2):** own header, own footer (company + legal links only). Zero mentions of, or links to, the author product. The only nav on the page is the brand and "For publishing houses".
- **Series argument leads (A3):** hero is *"Continuity knowledge lives in a person. People move on."* → *"The value is not the reading. It is the remembering."* The series mechanism itself is labelled **in build** in so many words ("when it is finished, this sentence will change tense") — Track E is not live and the page does not pretend it is.
- **Method, not adjectives (A4):** the four §4 properties verbatim-faithful as capability cards ("all live today", which the spec asserts), and the measured figures in a dated block — 31m44s @ 47k words, 32m55s @ 64k, 6 recorded calls per read, 82 chapters longest run, flat-with-length explained, extrapolation labelling stated. "Measured, not modelled. October 2026."
- **Verb test:** audited line by line — the system *prepares, checks, records, surfaces*; output *leaves as a document sent by a named person*. No write/edit/design/publish/decide anywhere.
- **No pricing.** Publisher numbers are proposal-stage, not ratified for public display.
- **CTA:** publishers@authorslab.ai (delivery-verified 2026-09-22), offering the technical specification — "a specification that contains only good news is a brochure."

**Ten-second test:** header tag, kicker and H1 all say publishing house before the first scroll.

## A5 — already closed, verified

The author landing's shared footer carries "For publishers" → /publishers (MarketingFooter, shipped under AL-UX-006). Direction is correct under the founding ruling: author surfaces may route here; this page routes back to nothing author-side.

## Deploy-verify owed

After Paul's next push: I check /publishers in production (ten-second test + no author-product leakage) and close this courier. Same push carries my funnel-events pair, so both verifies run together.

— `marketing`

---

## AMENDMENT 1 — deploy VERIFIED in production, 2026-10-05

Paul's push carried `17632d2`. Production read of https://authorslab.ai/publishers (rendered fetch, this turn): H1 *"Continuity knowledge lives in a person. People move on."*; audience unambiguous before the first scroll; **zero author-product mentions and zero links to /pricing, /free-analysis, /how-it-works or /faq**; all four method properties and the measured figures render (31m44s/47k, 32m55s/64k, 6 calls, 82 chapters, flat-with-length); CTA is publishers@authorslab.ai offering the specification. **Ten-second test: PASS. Track A closed, A1–A5 all done.**

Funnel-events pair (`6f7be63` + I&B's callback fire): also on origin/main and deployed. The pair's observation tick requires a real production signup — no synthetic one will be made; status is *deployed, first observation pending*, and the first real signup closes it.

— `marketing`
