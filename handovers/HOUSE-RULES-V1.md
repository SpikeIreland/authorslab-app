# AUTHORSLAB HOUSE RULES — V1 (2026-09-21)

One page. Every chat saves a memory line pointing HERE and re-reads on version bump. This is standing cross-chat doctrine; the **Slug Registry** in `COURIER-CONVENTION-V1.md` is the topology source. Where they differ, the Registry wins on ownership, this doc wins on process.

## Chats
`sysadmin` (this chat — architecture, shell, DB, n8n, coordination) · `wright` · `astudio` (Author Studio — Alex/Sam/Jordan) · `design` (Taylor) · `publishing` · `marketing` · `publisher` (Publisher's Journey / Portal) · `ux` · `finance` · `paul` (direction/decision inbox — not a chat, an addressee). SysAdmin allocates new slugs; do not mint your own.

## Deployment lanes
**Supabase migrations:** SysAdmin-direct via MCP (other chats via explicit assignment + quoted acceptance in a courier). **Vercel repo:** chats edit, Paul pushes — **Push Ceremony V1** (`PUSH-CEREMONY-V1.md`): stage+commit are ONE act by the owning chat, immediately — a staged index with no commit is a violation; explicit single-quoted paths only, never `-A`/`.`; chat quotes `git show --stat <hash>` post-commit; Paul's push = `git log origin/main..HEAD --oneline` read-back then `git push origin main` — *"Everything up-to-date"* on an expected-carry push is a FAILURE signal, not a success message. Non-main checkout restores main before turn end. **n8n:** chats draft via MCP, Paul publishes; multi-node edits get read-back before publish; a stop order means the workflow's `active` flag reads back false, not a cancelled execution. **Resend / Stripe / third-party:** chats propose config, Paul actions in the vendor UI, chat verifies via API/log read-back.

## Verify-deployed same-day
A change is done when its first tick is OBSERVED in production and quoted in the hand-over, not when the code merges. Vercel deploys carry a URL check; n8n publishes carry an active-version-id quote; Supabase migrations carry a `\d+ <table>` or view definition quote.

## Evidence discipline
Countersign the LOAD-BEARING claim and the POPULATION it quantifies over. Fingerprint/content-reads beat count-matching; drift diagnoses read the migration ledger FIRST. Match the instrument to the claim: populations get data reads, constants get code reads. Acceptance = the invariant view verbatim, query quoted; deep equality, never `>=`. `source_note` and classification reasoning are APPEND-ONLY.

## Data rules
Soft-delete + `deleted_at`; hard deletes only for machine-minted wreckage under an incident record. New tables ship RLS-ON WITH policies in the same migration + a query-through-RLS commissioning check; deny-all is forbidden UNLESS declared and commissioning-checked. Check-then-act = atomic CAS (`UPDATE … WHERE … RETURNING`). Client-side updates check affected-row count (RLS rejection is `rows=0, error=null`). Enum changes to `manuscripts.status` and similar constrained columns require Paul's explicit acceptance in the migration courier — the schema is the contract every derivation reads.

## Routing & couriers
Fixes route by CHAT ROSTER, never file proximity; a routing that names a file names the covering chat. Couriers live in `handovers/` under `<from>-to-<to>-<subject>-<date>.md`, signed by the chat that wrote them. **Courier Convention V1** (`COURIER-CONVENTION-V1.md`): canonical note once in `handovers/`; a 2-line POINTER (`CANONICAL:` line + action line) dropped into each addressee's `handovers/inbox/<slug>/` the SAME turn; your inbox = your unread — list at turn start, read canonical, delete pointer; pointers never copies. Before writing any courier: list `handovers/` newer than your last read and re-read the Slug Registry.

## Paul's inbox
`handovers/inbox/paul/` is where any chat queues a direction, decision, or approval Paul needs to make. Body = one sentence naming the question and the decision needed. Paul clears at his cadence; chats do not block waiting. A decision that changes doctrine lands as a courier ruling from `sysadmin` post-decision, with pointer to House Rules if a bump is needed.

## Invariants
Turning a workflow off is HALF an act — sweep its callers for graceful degradation in the same turn. Any ceremony change that takes a step away from a human must put it somewhere explicit, or it just deletes it. Constraint-over-sensor where a CHECK or unique index can enforce by construction. A dead prober must look like a dead route (fail-visible, never silently green).

*Version bumps announce via inbox pointer from `sysadmin` to all chats plus Paul. Full doctrine detail lives in each chat's memory and the cited rulings — this page is the shared floor, not the ceiling.*
