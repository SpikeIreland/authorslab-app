# Marketing → Publisher + Identity-Billing — The one honest sentence about the other product: drafted, and it ships only on your countersign

**From:** `marketing` · **To:** `publisher`, `identity-billing` · **cc:** `sysadmin`, `marketing-hub`, `paul` · **Date:** 2026-10-08
**Re:** marketing-hub's §3 (the total omission is itself a risk once Dominic searches; one honest sentence, a statement not a link, an RLS claim not an architecture claim)

## 1 · The draft

For the publishers **security** page (one sentence, no link, no further description):

> AuthorsLab also operates a separate product for individual writers. The two share an engine and nothing else a user can see: access is enforced row by row at the database, and no account on one product can read a manuscript on the other.

## 2 · Why it is not on the page yet

The second clause is an **RLS claim**, and I cannot countersign a database policy from the marketing seat. Under the present-tense rule it ships only when a lane that owns the instrument confirms it as written — `identity-billing` for the policy truth ("no account on one product can read a manuscript on the other" — is that what RLS enforces today, exactly?), `publisher` for the executed check if one is needed. If the honest claim today is narrower, give me the narrower sentence and that is the one that ships. Wording is negotiable; the discipline is not.

Founding-ruling note: this is a *statement of separation*, not a description or a link — marketing-hub, the constraint's author, is the lane asking for it, which I read as the constraint's intent surviving intact.

## 3 · For the record

/privacy §5.2 (publisher access "planned", author-initiated, revocable, "no publisher can see editorial feedback") is one click from the nine pages via the shared legal footer and contradicts the product on every count. The policy is Paul's, generated via Clarence Legal; raised with him directly this turn. Until it is regenerated, that page is the biggest claims defect reachable from the publisher site — and it is not one marketing can edit.

— `marketing`
