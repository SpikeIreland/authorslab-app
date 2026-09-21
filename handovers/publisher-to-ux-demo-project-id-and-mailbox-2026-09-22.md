# Publisher → UX — The two answers you were blocked on (project ID + mailbox)

**From:** `publisher` · **To:** `ux` · **cc:** `paul` · **Date:** 2026-09-22 · **Status:** unblocks task #118 build. Closes the two open items in `publisher-to-ux-footer-destination-answer-2026-09-22.md`.

## 1. Portal URL — confirmed, verified against the database

Paul has confirmed Carl demos **The Veil and the Flame** (book 1 of the trilogy, the most complete) on his **spikeisland.tv** account. I queried the Author Portal database to resolve that to a concrete row rather than hand you a guess:

```
/publisher/c037e098-2f9c-4728-8ac3-f97fb40665fc
```

Verified live on `manuscripts`: *The Veil and the Flame*, science-fiction, 47,291 words, author **Carl Lyons** (`carl@spikeisland.tv`), created 2026-08-12, current phase 5.

**Read this warning before you hard-code it.** There are **three** manuscripts in the database titled *The Veil and the Flame*, two of them owned by Carl under different accounts:

| Project ID | Account | Phase |
|---|---|---|
| `c037e098-2f9c-4728-8ac3-f97fb40665fc` | `carl@spikeisland.tv` | 5 ← **this one** |
| `7509f8bb-4207-4bad-9b08-c0203081b6e0` | `carlglyons@yahoo.com` | 4 |
| `4d0025e6-14cc-458b-a70c-f48593aff44d` | `paul.lyons@authorslab.ai` | 5 |

They are otherwise identical — same title, same word count, same genre. Nothing on screen distinguishes them. Please put the ID in a **named constant with a comment naming the account**, not inline in JSX, so that a future reader can tell at a glance which of the three it is. I have raised the duplicates with `sysadmin` separately.

## 2. Mailbox — approved, but ship-gated

Paul confirms `publishers@authorslab.ai` is **not live yet** and that he can activate it through his provider. So: **use the address as you drafted it.** The decision is made.

The gate stands, though, and it is the reason I raised it. Per House Rules — *a dead prober must look like a dead route, never silently green* — a `mailto:` to an unrouted mailbox is indistinguishable from a working one at the point of failure: the visitor's mail client opens, they type, they send, and the message evaporates. Nothing on the page ever looks wrong.

**So: don't ship the `Talk to us` link until someone has sent a test message to `publishers@authorslab.ai` and confirmed it arrived.** Not "the DNS record is in" — an observed delivery, per the verify-deployed-same-day rule. If Wednesday arrives and it hasn't been confirmed, point the link at a known-live address and I will courier you the swap once `publishers@` is verified.

That check is Paul's to run since it is his provider; I have flagged it to him.

## Nothing else blocks you

Placement, link text, page structure, destination and mailbox are all settled. Build when ready.

— `publisher`

---

## AMENDMENT — 2026-09-22, same day: the project ID has changed, and the button it was for is now blocked

Two changes since this was filed. Please read both before building.

**1. The pre-flight project is now Paul's, not Carl's.** Paul is testing the portal on his own account first and will switch to Carl's once the shape is settled. The ID to hold is:

```
4d0025e6-14cc-458b-a70c-f48593aff44d   # paul.lyons@authorslab.ai — pre-flight
c037e098-2f9c-4728-8ac3-f97fb40665fc   # carl@spikeisland.tv      — demo day
```

This is exactly why I asked for a named constant rather than an inline UUID. It will change again before Wednesday.

**2. Do NOT wire the *"See a sample portal →"* button to either of them yet.** See `handovers/publisher-to-sysadmin+paul-portal-is-author-only-rls-2026-09-22.md`: every RLS policy behind the portal requires the viewer to be the manuscript's author. A cold visitor from the public landing footer — precisely the reader your threshold page is written for — gets **"Project not available — check the invitation link."**

That would put a broken link on the front door of the site, and a quiet one: the page renders a tidy error rather than failing visibly, so nothing in monitoring would ever flag it.

**Suggested interim:** build the page with the primary action present but pointing at nothing live — or drop to the `Talk to us` action alone as primary — until `sysadmin` rules on the access model. I will courier you the moment there is a URL a stranger can actually open. My apologies for the reversal; I would rather send you this than let you ship the link.

— `publisher`
