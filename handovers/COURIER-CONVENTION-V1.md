# AUTHORSLAB COURIER CONVENTION — V1.1 (2026-09-22; V1 + `identity-billing` slug + direct-coordination reinforcement)

**From:** `sysadmin` (via Paul) · **Status:** standing convention, effective on ratification. Adapted from Clarence's Courier Convention V2. Read once, save to memory, adopt this turn. V1.1 bump detail in `sysadmin-courier-convention-v1.1-identity-billing-slug-and-direct-coordination-2026-09-22.md`.

## Why

Coordination across ten chats + Paul cannot survive on "Paul names the file to the right chat" — that scales as O(N²) and Paul becomes the bottleneck the OS was meant to remove. This convention adds per-chat UNREAD state, and nothing else.

## The convention

1. **Canonical notes live once.** Every courier is written ONCE to `handovers/` under `<from>-to-<to>-<subject>-<date>.md` (multi-addressee → `<from>-to-<to1>+<to2>-<subject>-<date>.md`). The archive, cross-refs, and staleness checks all run on the canonicals. Amendments go to the canonical file only.

2. **Delivery = a pointer, not a copy.** When you write a courier, ALSO write one small pointer file into `handovers/inbox/<chat>/` for EACH addressee and cc, path `handovers/inbox/<chat>/<date>--<canonical-filename>.md`. The pointer body is two lines:
   - Line 1 (load-bearing for scanners): `CANONICAL: handovers/<canonical-filename>.md`
   - Line 2: one sentence saying what it is and whether it carries an action for that chat.
   Copies are FORBIDDEN — they diverge when the canonical is amended, and a pointer cannot.

3. **Your inbox means UNREAD.** At the START of every turn, list `handovers/inbox/<your-slug>/`. For each pointer: read the canonical, act or queue as appropriate, then DELETE the pointer. An empty inbox is the goal state. Never delete another chat's pointers; never leave your own read pointers behind.

4. **Sender's obligation:** pointers are dropped in the SAME turn the courier is written — a courier without its pointers is undelivered, exactly as an n8n stop order without the `active` toggle read-back is not a stop. Gate-closing or build-holding notes ADDITIONALLY get the same-sitting verbal flag to Paul; the inbox is the floor, not the ceiling of urgency.

5. **Slug Registry** (SysAdmin owns; do not mint your own — same-name lessons apply with force):
   - `sysadmin` — this chat: architecture, shell, DB, n8n, coordination
   - `wright` — Wright
   - `astudio` — Author Studio (Alex/Sam/Jordan)
   - `design` — Design (Taylor)
   - `publishing` — Publishing
   - `marketing` — Marketing
   - `publisher` — Publisher's Journey / Portal
   - `ux` — UX
   - `finance` — Financial Modeling (pricing model, unit economics, forecasts)
   - `identity-billing` — User identity, auth flows, Stripe integration, plan gating, billing operations *(added V1.1, 2026-09-22)*
   - `paul` — Paul himself (direction/decision inbox; not a chat, an addressee)

6. **Paul's role shrinks to a poke.** His message to any chat can be "check your inbox". He no longer names files, and multi-addressee notes cost him nothing extra. When Paul owes any chat a decision, chats queue it in `handovers/inbox/paul/` rather than blocking mid-turn.

7. **Direct chat-to-chat coordination is the norm** *(V1.1, 2026-09-22)*. When one chat needs something from another, the pointer goes to that chat's inbox — not to `sysadmin` as a middleman. `sysadmin` coordinates architectural, schema, and deployment-lane decisions; operational conversations between chats run peer-to-peer. Cc `sysadmin` when: (a) the outcome touches the shell, schema, or a deployment lane; (b) the decision sets a precedent worth recording centrally; (c) a peer ask has been open for more than three turns without response.

## Delete-on-read protocol

Delete-on-read requires file-deletion permission for the workspace folder.

1. **Try `rm` first.**
2. **If refused** ("Operation not permitted"), load `mcp__cowork__allow_cowork_file_delete` via ToolSearch and call it with the file path — this surfaces Paul's approval prompt; on approve, deletion is enabled for the whole folder for the rest of the session.
3. **If the tool is absent or refused**, PARK: `mv handovers/inbox/<slug>/<pointer> handovers/read-pointers/<slug>--<pointer-filename>`. Your inbox then honestly reads empty. `handovers/read-pointers/` is a shared parking lot; SysAdmin purges wholesale at turn starts — everything in it is by definition read and disposable.

Ad-hoc `_to_delete` folders are FORBIDDEN. Un-deletable read pointers stay in `read-pointers/` as a declared backlog, never in a private junk drawer.

## Bootstrap (this turn, every chat, once ratified)

Save this convention to your memory (one line: inbox at `handovers/inbox/<your-slug>/`, check at turn start, pointer-on-send, delete-on-read). Then process whatever is already in your inbox — `sysadmin` will seed known open items on ratification.

## The founding pointer

Before this convention exists in a chat's memory, `sysadmin` announces V1 to every slug via inbox pointer. The first thing every chat does on next boot: read `HOUSE-RULES-V1.md` + `COURIER-CONVENTION-V1.md` + `PUSH-CEREMONY-V1.md`, save memory, delete the pointer.

— `sysadmin`
