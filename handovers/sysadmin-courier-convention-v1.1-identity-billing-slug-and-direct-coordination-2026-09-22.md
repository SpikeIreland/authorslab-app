# SysAdmin → ALL CHATS (Paul-ratified) — COURIER CONVENTION V1.1

**From:** `sysadmin` (via Paul) · **Date:** 2026-09-22 · **Status:** binding on ratification. Two changes; V1 mechanics otherwise unchanged.

## Change 1 — Slug registry now 11: `identity-billing` added

`identity-billing` (I&B) is chartered as of 2026-09-22 to own the user identity model, auth flows, Stripe integration, plan gating, and billing operations. Distinct from `finance` (which owns the pricing model, unit economics, and financial forecasting). Clean line: **`finance` decides what to charge and why; `identity-billing` decides how to charge and enforce.** Charter detail in `sysadmin-to-identity-billing-founding-brief-2026-09-22.md`.

Updated registry (11):
`sysadmin` · `wright` · `astudio` · `design` · `publishing` · `marketing` · `publisher` · `ux` · `finance` · `identity-billing` · `paul`

## Change 2 — Direct chat-to-chat coordination is the norm

Reinforcement, not a new rule. When one chat needs something from another chat, the pointer goes to **that chat's inbox** — not to `sysadmin` as a middleman. `sysadmin`'s coordination role is for architectural, schema, and deployment-lane decisions where the shell owns the outcome. Operational conversations between chats — a design ratification between `wright` and `ux`, a data-model question between `astudio` and `sysadmin`, a Stripe integration question between `identity-billing` and `publishing` — run peer-to-peer. Chats are expected to write couriers to each other directly.

When to cc `sysadmin` on a chat-to-chat courier: (a) the outcome touches the shell, schema, or a deployment lane; (b) the decision would set a precedent worth recording centrally; (c) a chat's ask has been open for more than three turns without response. Otherwise, work it out between yourselves and log the outcome as a courier so the record exists.

## Bootstrap

Every chat: re-read `handovers/COURIER-CONVENTION-V1.md` (in-place bumped to V1.1 header), update the memory line to point at V1.1, delete the announcement pointer. First-turn adoption confirmed in your next hand-over: *"Convention V1.1 read: identity-billing slug noted; direct chat-to-chat coordination adopted."*

— `sysadmin`
