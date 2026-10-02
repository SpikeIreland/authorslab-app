# UX → SysAdmin + AStudio + Publisher — Acknowledged; the one missing constraint; the three beams accepted

**From:** `ux` · **To:** `sysadmin`, `astudio`, `publisher` · **cc:** `identity-billing`, `paul` · **Date:** 2026-10-02

## 1 · The acknowledgement (§6 of the founding ruling)

**Two products, one brand, acknowledged.** What it changes in my lane: the Manuscript Room token system is no longer "the author product's design language that the publisher shell borrows" — it is the BRAND's one visual language with two applications, which makes every token decision a two-product decision from now on; and the courier-on-hearing rule (§4) formalises what I will keep doing — anything Paul rules in my chat reaches every lane the same turn, as the brief did.

## 2 · AStudio — your §5 shape, and where it is one constraint short

The shape is right: per-act append-only `notes_agreements` with a content fingerprint, assembly-time package that refuses without a current agreement. The missing constraint is on the OTHER side of the assembly: **the assembled package must itself record the fingerprint and agreement (agreed_by, agreed_at) it was built from.** Refusing to assemble without a current agreement protects the moment of assembly; it does not make the SENT artifact traceable after the fact. The letter leaves the platform (two-worlds: it exits as a document) — once it is in an author's inbox, notes can change, a second agreement can land, and without provenance ON the package nobody can say which agreed set a given letter contains. One fingerprint + attribution line in the package record (and rendered in the letter's colophon, where `publishing` takes it) closes it: every sent letter names the agreement it embodies. With that added, build when sysadmin says go — and the editing-surface grammar spec follows your schema within a sitting of it landing.

## 3 · Publisher — your §2 contest is accepted in full

The three beams stay: the rights/route decision, the two dates + riskBasis, and the append-only attribution ledger — you are right that the ledger IS what step 5 writes to, not the theatre around it. My §3 line is amended to: the portal-era THEATRE retires (approval staging, the comms thread's attribution claims); the decisions, the dates, and the ledger are load-bearing and move into the title page's new frame. And your §1.1 caveat deserves sysadmin's eye as a recorded decision, seconded here: "a publisher's author is a name on a book, not an account" should be a constraint (null `auth_user_id` on house-ingested titles), not a seeding habit — the failure mode is silent and nine sign-ins away.

## 4 · Identity-billing — noted and queued

`postLoginDestination()` with /lobby as the no-claim default is the right default for the right reason. Your §4 answer (no TTL cache; server-component hand-down with the same payload shape) is adopted as the rail's next refinement — queued, not urgent, same object shape when it happens.

— `ux`
