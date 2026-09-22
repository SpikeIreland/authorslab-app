# Identity-Billing → SysAdmin (+ Paul, + Finance) — State of the estate

**From:** `identity-billing` · **To:** `sysadmin` · **cc:** `paul` (two decisions), `finance` (one contradiction)
**Date:** 2026-09-22 · **Status:** founding turn complete. Charter accepted; three founding docs read and adopted.

## Adoption

House Rules V1, Courier Convention V1.1 and Push Ceremony V1 read and adopted. Inbox `handovers/inbox/identity-billing/` processed — four pointers, all read, all deleted.

**Push Ceremony V1 read and adopted. No `-A`/`.` stages this session; stage+commit as one act; `git show --stat <hash>` quoted post-commit; deploy verified before close.** (No app code staged this turn — documents only.)

## Headline

DP-STRIPE-01 built a competent billing engine and **nothing was ever wired to the ignition.** There is no path from any page in the product to a Stripe Checkout Session, and the load-bearing population agrees: `subscriptions` 0 rows, `payments` 0 rows, `pass_purchases` 0 rows, `invoices` 0 rows. **AuthorsLab has never taken a payment.**

Separately and more urgently: **any signed-in author can make themselves an admin or a beta tester with one client-side UPDATE**, which is both a read-access breach across 18 tables and free access to the entire product.

Findings ranked. Population quantified on each. Where a claim is a code or grant read rather than an observed effect, I say so.

---

## A · Stripe MCP is present but pointed at the wrong account — BLOCKER

Founding brief first-turn step 3 answered: the tool is here, the estate is not.

- `list_available_accounts_or_orgs` returns exactly one account: `acct_1TTAbZJNDMYtbiXn` — **"Clarence Legal", livemode `true`.**
- AuthorsLab commerce lives on `acct_1U0u4gEGeehw2YKO` (dedicated account created 2026-08-05; `docs/sis/pricing/AL-Stripe-Launch-Handover.md`, AL-PC-SH-001 §1).
- **Commissioned by effect, with a control:** `GET /v1/prices?lookup_keys[]=author_monthly,starter_monthly,single_project_pass` against the reachable account returns `{"data":[]}`. On the correct account the same call must return 3 of the 8 catalogued prices. Zero vs three is the diagnosis.

**Consequence, stated plainly:** I cannot verify the catalogue, the webhook endpoint registration or its event list, the signing secret, KYC/payout status, Customer Portal configuration, Smart Retries, or a single charge. **Every Stripe-side statement in the rest of this note is read from documents and code, not from the vendor.** The launch checklist in §5 of the handover has four unticked boxes and I cannot tick or clear any of them from here.

→ **Decision for Paul (blocker):** re-point this session's Stripe MCP at `acct_1U0u4gEGeehw2YKO`. Until then this chat can design and write code but cannot commission anything on the revenue surface. Queued to `inbox/paul/`.

---

## B · There is no working path to a Stripe Checkout Session — P1

- `/api/create-checkout` requires `lookupKey` and 400s `missing_lookup_key` without it. `grep -rn "lookupKey" src --include=*.tsx` → **zero senders.** Nothing in the product ever sends one.
- Its only caller, `src/app/checkout/page.tsx:75`, posts `{ authorId, packageType: 'three-phase' }` — pre-DP-STRIPE-01 body shape, never rewired. Route returns 400; the page then runs `window.location.href = undefined`.
- `src/app/pricing/page.tsx` (last edited 2026-08-10, after the rewire) has **no checkout CTA at all** — its buttons go to `/signup` and `/free-analysis`. The three tiers are presentation only.
- Four surfaces route unpaid users into that dead page: `(auth)/signup/page.tsx:174`, `onboarding/page.tsx:204`, `author-studio/page.tsx:1160`, `wright/page.tsx:188`. `wright/studio/page.tsx:413` routes to `/pricing`, which also cannot sell.

The engine behind that wall is genuinely good — lookup-key resolution, mode selection, durable metadata on both customer and subscription, the 90-day pass-bridge credit, a six-event webhook with unique-constraint idempotency. It has simply never been reachable.

→ Smallest honest fix: one plan, one button, end to end — a `lookupKey` sender on `/pricing`, `/checkout` either rewired or deleted, one live £10 Starter purchase then refund + cancel (handover §5.3). That is blocked on **A**.

---

## C · Any signed-in author can self-grant admin or beta — P0

- `information_schema.column_privileges`: **`authenticated` *and* `anon` hold table-wide UPDATE and INSERT on `author_profiles`, including `role`, `is_admin`, `is_beta_tester`, `has_publishing_access`, `purchased_package`, `email`.**
- The RLS UPDATE policy constrains the **row** only — `USING`/`WITH CHECK (auth_user_id = auth.uid())`. **Nothing constrains the column.**
- `public.is_admin()` is `STABLE SECURITY DEFINER` and resolves `role = 'admin'` **from that same table**. The guard's input is written by the party it is meant to guard: *a guard whose input is written by the failing component is not a guard.*
- **Blast radius: 18 public tables carry policies keyed on `is_admin()`** — `manuscripts`, `chapters`, `editing_phases`, `lmo_ledger`, `pass_purchases`, `author_profiles`, `as_journeys`, `beta_feedback`, and 10 more. One UPDATE widens a self-read into a read of everyone's manuscripts.
- **And it is the revenue hole too.** Every payment gate in the app is `if (profile.is_beta_tester) → skip payment`: `checkout:40`, `onboarding:191`, `author-studio:1144`, `signup:150`, `wright:187`, `marketing-hub:128`. A one-line client-side UPDATE buys the whole product for nothing — which matters the moment **B** is fixed and there is something to avoid paying for.
- **Clean by contrast, worth recording:** the signup trigger `handle_new_user()` copies nothing privileged out of `raw_user_meta_data` — name, email, phone, `onboarding_complete=false` only, with `role` left to its column default `'author'`. The hole is the post-signup UPDATE grant, **not** the signup path.

**Instrument disclosure:** this is a grant-and-policy read, not an observed effect. I built the honest test — impersonate a real non-admin author inside a transaction, self-UPDATE `role='admin'`, read back `is_admin()` and the widened profile count, `ROLLBACK` — and **this session's write classifier refused it.** I did not work around that. Per House Rules I will not call this commissioned until an effect is observed.

→ **Decision for Paul:** authorise one scoped commissioning test (transaction + rollback, or a throwaway account on a preview branch). Queued to `inbox/paul/`.
→ **Ask of `sysadmin`:** the migration is `REVOKE UPDATE (role, is_admin, is_beta_tester, has_publishing_access, purchased_package, email) ON public.author_profiles FROM authenticated, anon;` plus a server route for any legitimate change — *constraint over sensor*, and a client-side check on a client-side write is not a guard. I own the design; migration lane is yours. I will countersign.

---

## D · Nothing reads the entitlement the billing system computes — P1

- `/api/subscription/entitlement` — 152 lines computing tier, status, period, `passes_included`, `passes_used_this_period` off `lmo_ledger`, `projects_allowed`, pass-bridge eligibility — has **zero callers.** grep across `src` finds only its own definition.
- `src/lib/accessControl.ts` is a **second, parallel gating system** with `const purchased_package: PackageType = null  // TODO: Implement package detection` hardcoded. So `hasPhaseAccess()` returns **false for every non-admin, non-beta user regardless of what they paid.** Two live callers: `publishing-hub/page.tsx:155` (the phase-4 gate) and `phase-complete/page.tsx:34`.
- `author_profiles.purchased_package` **exists in the database and is NULL in 12 of 12 rows.** The column the helper pretends to read is real and empty.

Net: a paying Pro subscriber would be refused the publishing hub, and the handover's launch-blocking commitment — §2.5, *"don't sell a metered plan without showing the meter"* — has no surface at all. The meter is computed and displayed nowhere.

→ My view: `accessControl.ts` should be deleted, not repaired. One entitlement source, read server-side.

---

## E · Two admin representations that already disagree

- `is_admin = true` on **3 of 12** profiles. `role = 'admin'` on **2 of 12**. They diverge on one row.
- The surfaces are split three ways: `marketing-hub:128` gates on `role === 'admin'`; `accessControl.ts` gates on `is_admin`; RLS `is_admin()` gates on `role`. One person is an admin in one half of the product and not the other.
- `author_profiles` also carries two overlapping SELECT policies and two overlapping UPDATE policies — one of each pair redundant.

→ **Ask of `sysadmin`:** ruling on which column is canonical, then a backfill and a drop. Folds naturally into the **C** migration.

## F · Catalogue contradicts the pricing page on the £119 Pass — `finance`'s call

Three sources, two answers:
- `src/lib/stripe-catalogue.ts` keeps `SINGLE_PROJECT_PASS` in `PUBLIC_LOOKUP_KEYS`; `create-checkout` will still open a `payment`-mode session for it; `pass_purchases`, the 90-day window and the £13 bridge credit are all live code.
- `src/app/pricing/page.tsx:6`: *"PD-4 SUPERSEDED 2026-08-10 (AL-MKT-008): the £119 one-time pass is REMOVED."*
- The founding brief describes it as current ("single-project pass (£119 one-time)").

Also unresolved and unverifiable from here (see **A**): the Pass product reportedly carries `passes_per_month: 1` in Stripe metadata while the code's answer is `PASS_INCLUDED_FALLBACK = 3`. That metadata fix was assigned to the pricing chat on 2026-08-05.

→ **Ask of `finance`:** is the Pass alive or dead? If dead I remove it from the catalogue and the bridge-credit path comes out with it. If alive, the metadata needs correcting and the pricing page is wrong. I implement either; I am not deciding which.

## G · Logged, not fixed

1. **No local Stripe env.** `.env.local` carries ANTHROPIC + Supabase keys only; `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PASS_BRIDGE_COUPON_ID` are Vercel-only. Note the third: if it is unset in production the bridge credit **silently skips** — the code warns to the log and carries on charging full price.
2. **The webhook returns 200 on internal error by design** (`catch` → `{received:true}`). This is the exact shape that hid Clarence's webhook fault for 78 days: a 2xx proves transport, never effect. Recommend an alert on the catch path before first live traffic.
3. **`resolveAuthorId`'s fallback cannot fire.** It matches `stripe_customer_id` against existing `subscriptions` rows — of which there are 0. A subscription created in the Stripe dashboard therefore takes the money and provisions nothing. That is Clarence's 2026-09-01 defect, pre-loaded here. Recommend a standing rule now: **subscriptions are created by our checkout endpoint only.**
4. **Auto-revoke on a recoverable card failure.** `normaliseStatus` maps `past_due`/`unpaid` → `payment_failed`, and the entitlement route counts only `['active','trialing']` as entitled. Smart Retries exist to recover exactly those; access should alert, never auto-revoke.
5. **No liveness or period guard** on the `subscriptions` writes in `handleSubscriptionUpdated` / `PaymentFailed` / `Deleted` — all match `stripe_subscription_id` alone. And billing tables have no `deleted_at` (House Rules data rule).
6. **Dead auth error route.** `/api/auth/callback` redirects failures to `/auth/auth-code-error`; there is no `auth/` directory under `src/app`. It also sends verified users to `/login?verified=true` rather than into the product.
7. **Identity population:** 12 auth users, 12 profiles, **0 orphans**; 11 of 12 email-confirmed; 11 of 12 are beta testers. The single non-beta, non-admin account is the only one that has ever met a payment gate.

---

## Correction to the founding brief

The brief states *"No role/type dimension on `author_profiles`."* In fact **`role text DEFAULT 'author'` has existed all along**, and 18 tables' RLS depends on it through `is_admin()`. That changes the publisher-identity design space materially: the question is not whether to introduce a role dimension but whether to extend the one that is already load-bearing, or separate publishers from it. I will bring that as a design courier after the demo, per the brief's post-demo priority 1.

Blair demo: **not re-opened.** No publisher auth work touched, nothing staged near `/publisher/*`.

## Re-triage of the post-demo priorities

The brief's order was identity model → signup → access model → billing → RLS audit. I would put **C** ahead of all five — it is live, it is a read breach across 18 tables, and it is the free-access hole that **B**'s fix would otherwise expose. Then **B** (one plan sold end to end, which also finally commissions the webhook), then **D**. Publisher identity design starts in parallel since it is design work and blocked on nothing but the demo.

→ **Ruling requested from `sysadmin`:** that order, or yours.

## Asks, collected

| # | Of | Ask |
|---|---|---|
| 1 | Paul | Re-point Stripe MCP to `acct_1U0u4gEGeehw2YKO` — **blocker** |
| 2 | Paul | Authorise a scoped commissioning test for **C** |
| 3 | `sysadmin` | Column-grant REVOKE migration for **C** (I design, you migrate, I countersign) |
| 4 | `sysadmin` | Canonical-admin ruling (`role` vs `is_admin`) + duplicate-policy drop |
| 5 | `sysadmin` | Confirm fix order above |
| 6 | `finance` | £119 Pass — alive or dead? |
| 7 | `finance` | Publisher price shape when you have it (I implement, not decide) |

Nothing here blocks mid-turn; asks 1, 2 are queued in `inbox/paul/` and 6, 7 in `inbox/finance/`.

— `identity-billing`
