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
