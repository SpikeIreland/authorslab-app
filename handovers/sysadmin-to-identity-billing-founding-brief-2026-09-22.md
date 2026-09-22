# SysAdmin → Identity-Billing — Founding brief for the I&B chat

**From:** `sysadmin` (via Paul) · **To:** `identity-billing` (new chat) · **Date:** 2026-09-22 · **Status:** chartering. Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1` (V1.1), `PUSH-CEREMONY-V1` first.

## Why this chat exists

Two forcing functions arrived together:
1. **Publisher becomes a first-class audience.** Currently AuthorsLab has one user type (author). The Publisher's Journey chat is chartered; publishers will need identity, permissions, and eventually billing distinct from authors. That expansion has nowhere to live.
2. **Stripe integration has grown up.** DP-STRIPE-01 (task #88) shipped the author billing rewire — subscription + single-project-pass, webhook handling, plan gating. That's live code with a real vendor surface and a real blast radius if it goes wrong. It needs a single owner.

Identity was scattered (schema-in-`sysadmin`, pricing-in-`finance`, ad-hoc Stripe). This chat consolidates it.

## What you own

- **User identity model** — `author_profiles` today, `publisher_profiles` and any future role/type dimension. Schema decisions on identity tables (via `sysadmin` for the migration lane; you own the design).
- **Auth flows** — Supabase Auth configuration, signup/login/reset flows, custom SMTP wiring (currently Resend), post-signup routing per user type.
- **Stripe integration** — SDK version, webhook handling, subscription lifecycle, payment methods, customer records, credentials/API keys.
- **Plan gating and permissions** — which routes/features gate on which plan or role; RLS decisions that follow from role.
- **Billing operations** — customer support flows for refunds/disputes/plan changes; reconciliation; abuse handling.

## What you do NOT own

- **Pricing model** — that's `finance`. `finance` decides *what* to charge and *why* (unit economics, price points, publisher deal shape). You decide *how* to charge and enforce.
- **Feature-station work** — Wright's flow, Author Studio's editing surface, Design's cover composer, etc. Each station owns its station.
- **Marketing pricing pages** — `marketing` writes the copy on `/pricing`. You confirm the pricing implementation matches; you don't write the page.

## Context you inherit

**Identity today:**
- `author_profiles` table keyed to Supabase Auth `auth.users`. Trigger creates a profile row on signup.
- No `publisher_profiles`. No role/type dimension on `author_profiles`. Publisher is not a first-class user type in the schema yet.
- Supabase Auth configured with Custom SMTP via Resend (see `2026-09-21` work). Sender `hello@authorslab.ai` for auth emails.

**Stripe today (from DP-STRIPE-01, task #87-88):**
- Author subscription (£10/month) + single-project pass (£119 one-time)
- Webhook handling live
- Plan gating implemented (Stripe subscription state → app permissions)
- `/checkout/success` confirmation page (task #91)
- Stripe MCP access: session-level capability. When this chat is opened, ensure the session has Stripe MCP configured (Paul: this is how Clarence's I&B chat operates — same pattern needed here).

**Publisher today:**
- `/publisher/[projectId]` route renders a mock with hard-coded sample data. **No auth gate.** Anyone with the URL sees the mock. This is by design for the Blair demo — see next section.
- Founding brief for the Publisher's Journey chat: `handovers/sysadmin-to-publisher-founding-brief-2026-09-21.md`.

## Blair demo (2026-09-24) — RATIFIED, do not re-open

Paul ratified 2026-09-22: **no publisher auth work is required for the demo.** Carl (carl@spikeisland.tv) will navigate directly to `/publisher/<his-project-id>`, the mock renders, story lands. No `role: 'publisher'` flag, no gated route, no signup flow. Two hours of implementation with no on-camera payoff for a 60-90 second cameo — declined.

Your first substantive publisher-identity work begins **after** the demo, informed by whatever comes out of the meeting.

## Post-demo priorities (initial view; you'll re-triage in your first courier back)

1. **Publisher identity model design.** Schema shape (separate `publisher_profiles` table? role column on a unified `user_profiles`? something else). Coordinate with `sysadmin` on the migration.
2. **Publisher signup flow.** Landing (from the footer link `ux` is designing — task #118), form fields, verification, post-signup routing to `/publisher/*`.
3. **Publisher access model.** Which projects does a publisher see, and how? Invited to specific projects by authors? A workspace of writers under the publisher's imprint? This is a product decision with `publisher`.
4. **Publisher billing model.** Once `finance` has a publisher pricing shape (per-manuscript, per-seat, per-writer-catalog, enterprise?), you implement it in Stripe. Not urgent — Paul is not disclosing publisher pricing at Blair.
5. **RLS audit for the two-user-type world.** Every RLS policy currently assumes author. Publishers arriving changes the read/write matrix for shared entities (manuscripts, chapters, comments).

## Coordination with `finance` (critical)

`finance` has a pending disclosure ask (see `handovers/sysadmin-to-finance-monetisation-alignment-2026-09-22.md` — cc'd to you). Read their state-of-monetisation reply when it lands; it establishes the WHAT you'll implement the HOW for. Your first big design courier (publisher billing) waits on their input on the publisher price shape.

## Coordination protocol

Per Courier Convention V1.1:
- Your inbox is at `handovers/inbox/identity-billing/`. Check at every turn start.
- Direct chat-to-chat coordination: pointers go straight to peer inboxes (not via `sysadmin`) unless the outcome touches shell/schema/deployment.
- Coordinate with: `finance` (pricing model), `publisher` (publisher user experience), `sysadmin` (schema migrations, RLS, deployment lanes), `ux` (auth flow language and post-signup routing).
- Decisions for Paul → pointer to `handovers/inbox/paul/`. Do not block.
- Push Ceremony V1 binds when you stage code: explicit single-quoted paths, stage+commit as one act, `git show --stat <hash>` in the hand-over.

## First-turn instructions

1. Read the three founding docs (with Convention at V1.1) and this brief.
2. Save memory: your slug (`identity-billing`), your inbox path, your charter (this document — identity + auth + Stripe + plan gating + billing ops).
3. **Verify Stripe MCP is available in your session.** If not, file a pointer to `handovers/inbox/paul/` naming it as a blocker — real work needs the tool.
4. Read the current billing code (`/src/app/api/stripe/*`, webhook handlers, `/checkout/*` pages, the DP-STRIPE-01 commit history) and the current identity code (`author_profiles` schema, `/api/auth/*` if any, Supabase Auth trigger). File a "state of the estate" courier back to `sysadmin` — what's built, what's brittle, what's undocumented.
5. Delete this pointer when the state-of-the-estate courier is filed.

Welcome aboard.

— `sysadmin`
