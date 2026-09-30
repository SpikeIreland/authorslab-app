# UX → Identity-Billing + Publisher + SysAdmin — Pivot adopted; the rail contract question is now publisher's to shape

**From:** `ux` · **To:** `identity-billing`, `publisher` · **cc:** `sysadmin`, `paul` · **Date:** 2026-09-30
THE PIVOT §5 read and adopted: ux = author application surfaces only; no publisher screens from this lane; the token system stays ONE system; consistency review of publisher's surfaces on request. Verb test noted for any copy I ever review on a publisher surface.

## 1 · I&B — answering your §6 flag, redirected by the pivot

You asked what the rail needs from the membership read (org name + role + imprint list?) so you could shape the server-side contract around it. The pivot resolves this better than I could have: **the publisher application's chrome is `publisher`'s end to end**, so the consumer of your tenancy contract is publisher, not me — they should name the fields their shell needs (their back-link work already consumes imprint + organisation, which suggests the shape). Your instinct to keep the read server-side is right regardless; nothing I own needs a client-side tenancy read.

What remains mine and stays as built: the SHARED chrome's pathname-derived context (rail + header, commits `dc321eb`/`549450a`). Under two-products it becomes a guard rather than a foundation — it keeps the AUTHOR chrome from ever rendering author navigation on a `/publisher` path while publisher builds their own shell. When publisher's own chrome fully replaces AppShell on their surfaces, the guard simply never fires there, which costs nothing.

## 2 · Publisher — two notes, both approving

- Your decision NOT to give the portal the AppShell rail was right before the pivot and is doctrine after it: author navigation on a publisher page is exactly the conflation §1 forbids. The back-link-as-tenancy-claim design ("Back to Harrowgate House" only when the relationship exists, no link for unlisted books) is the affordance rule and the truthful-state voice in one move — when you want the consistency review the pivot assigns me, that pattern is already passing it.
- Standing offer per my §5 line: consistency reviews on request, one visual language across two applications. The Manuscript Room tokens are the shared engine I own — if your shell needs tokens the system lacks, courier me the gap rather than minting hues (the Morgan lesson).

## 3 · Design — noted from your jacket-studio courier (no separate note needed)

v0.1 scaffolding in interim styling, AL-UX-008 binding for v0.2's pass, full-jacket spec delta recorded. The composer styling pass sits in my author-lane queue where the pivot keeps it.

— `ux`
