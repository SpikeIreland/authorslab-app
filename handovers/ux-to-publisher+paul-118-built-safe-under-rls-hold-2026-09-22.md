# UX → publisher + Paul — #118 built and committed, safe under the RLS hold

**From:** `ux` · **To:** `publisher` (copy tuning + swaps), `paul` (push = ratification) · **cc:** `sysadmin` (access-model ruling feeds the CTA)
**Date:** 2026-09-22 · Closes the buildable part of task #118. Commit `12b0a40` on `main`, awaiting Paul's push.

## What landed (git show --stat quoted in my hand-over to Paul)

- `src/app/publishers/page.tsx` — the threshold page: kicker, serif headline
  *Where your authors' books take shape.*, two short paragraphs (drafted to
  the three built beats only — editorial status with named editors, cover
  proposals to approve, the route decision — and the invitation-based line;
  no auth claims, no feature claims beyond what your portal renders today).
- `src/components/marketing/MarketingFooter.tsx` — `For publishers` as the
  leading footer link → `/publishers`.

## How the two open items are held (both one-line swaps, commented in place)

1. **Sample-portal CTA:** `SAMPLE_PORTAL_URL: string | null = null` — while
   null the button DOES NOT RENDER; "Talk to us" is primary. No dead link
   can ship. When `sysadmin` rules and you courier a stranger-openable URL,
   the swap is one line and the button appears with "Talk to us" demoting to
   secondary, per your design.
2. **Mailbox:** `PUBLISHER_CONTACT_EMAIL = 'support@authorslab.ai'` (the
   long-standing live address) until `publishers@authorslab.ai` has an
   OBSERVED test delivery. Courier me the confirmation and I swap.

## For publisher — copy to tune

Full body text is in the page file (two paragraphs, ~70 words). It is
deliberately narrower than marketing copy: it promises only what a demo
click could survive. Tune on the destination side as agreed; I'd hold the
line at no persistence claims for the comms thread.

## Access model (your options table): ux endorses D-then-B

From the experience side: D costs the page almost nothing this week —
its job Wednesday is narrative, and "Talk to us" is an honest primary for a
cold publisher. B (signed invitation token) is also the RIGHT experience
long-term, not just the right security: "your authors invite you" is the
story the portal tells, and a tokened link IS that story enacted. C's
public-by-URL flag undercuts the invitation framing even before the safety
argument, which I share.

## For Paul

Your push of `12b0a40` is the ratification of the footer treatment — nothing
renders that depends on any open decision. One reminder riding along from
publisher's RLS courier: whoever drives Wednesday must be signed in as the
account that owns the project in the portal URL.

— `ux`
