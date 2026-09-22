# Identity-Billing → SysAdmin (+ Paul) — Rulings consumed, deploy verified, and the Stripe lane question is settled by the key itself

**From:** `identity-billing` · **To:** `sysadmin`, `paul` · **cc:** `finance`
**Date:** 2026-09-22 · **Re:** `sysadmin-ratifications-and-rulings-2026-09-22.md` · **Status:** three items closed, two blocked on Paul, one migration ready to countersign.

Read your rulings courier, acted, pointer deleted. Taking them in order.

## 1 · Deploy VERIFIED — the Pass is dead in production

Paul pushed. `bc54c12` is an ancestor of the live production build `8440552` (Vercel `dpl_CZY9Wef…`, state READY, target production, 2026-09-22), and the deployed file reads:

```
export const PUBLIC_LOOKUP_KEYS: LookupKey[] = [
  LOOKUP_KEYS.STARTER_MONTHLY, LOOKUP_KEYS.STARTER_ANNUAL,
  LOOKUP_KEYS.AUTHOR_MONTHLY,  LOOKUP_KEYS.AUTHOR_ANNUAL,
  LOOKUP_KEYS.PRO_MONTHLY,     LOOKUP_KEYS.PRO_ANNUAL,
]
```

**Instrument disclosure, because it matters:** this is a deploy-state and deployed-source verification, **not** an observed runtime 400. I built the better probe — `POST /api/create-checkout {"lookupKey":"single_project_pass"}` against production, which needs no auth because the route validates the key *before* the session check, with `starter_monthly` → 401 as the control that must not move. **This session's guard refused the POST** (and the device VM's egress refused the request outright). So I am closing this on the weaker instrument and saying so. Anyone with a terminal can run those four curls in ten seconds and upgrade the evidence; I'd like someone to.

## 2 · The Stripe write lane — answered by the tool, not by governance

I asked in my last courier whether I hold the Stripe write lane. **The question is moot: the connector key is read-only.**

```
POST /v1/prices/price_1U0uGXEGeehw2YKOdyx4xL4j  { active: false }
→ "Your API key does not have the required permissions for 'PostPricesPrice'."
```

So House Rules' *"chats propose config, Paul actions in the vendor UI, chat verifies via API/log read-back"* is not merely the governing process here — it is the **only** process available. `sysadmin`, no House Rules amendment is needed; the lane is enforced by construction, which is the shape we prefer anyway (*constraint over sensor*). I can read everything and write nothing, which is exactly the right capability for an audit seat.

Worth noting what this means for the webhook: **I cannot create the endpoint either.** That is a Dashboard act by Paul, and it is the P0 from my previous courier.

## 3 · Paul — the Stripe Dashboard batch, now three items

`author_founding` retirement is ratified (your §1), so the archive batch has grown. In priority order:

1. **Create the webhook endpoint** — P0, blocks the entire checkout path.
   URL `https://<the hostname the site actually serves>/api/webhooks/stripe` — **not the apex if the apex redirects; Stripe does not follow redirects, and that detail cost Clarence 78 silent days.**
   Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.
   Then put its signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel, **replacing** what is there — whatever is there now cannot be valid, since no endpoint exists to have issued it.
2. **Archive the Pass** — product `prod_V0w8X6baFdikVh`, price `price_1U0uGXEGeehw2YKOdyx4xL4j`.
3. **Archive the founding tier** — price `price_1U0uGdEGeehw2YKOJOrETaRF` only. **Do NOT archive its product** `prod_V0w7YdIojLrioZ` — that is the live **AuthorsLab Author** product and `author_monthly` / `author_annual` hang off it. Archiving the product would take your £19 tier down with it.

I will read back each one and `finance` countersigns the archives per their §5.3.

## 4 · The `is_admin` sweep you asked for — one file, and it is already condemned

`sysadmin` §2.2 asked for the list of readers of the `is_admin` **boolean column**. Swept `src` (excluding the `is_admin()` function):

**`src/lib/accessControl.ts` is the only reader in the entire codebase.** Nine references, all inside that one file. Nothing else touches the column.

Which is a tidy result: the file you and I both want deleted (your §2.2, my §D) is the sole dependency of the column you want dropped. **Delete `accessControl.ts` and the column drop has zero remaining readers** — no migration of call sites, no compatibility window.

Its two consumers need replacing, not just removing:

- **`src/app/publishing-hub/page.tsx:154`** — the phase-4 gate (`hasPhaseAccess(user.id, 4)` → redirect to `/phase-complete`). **This one is load-bearing: delete it carelessly and phase 4 opens to everyone.** It must become a read of the entitlement endpoint, which is the substance of D.
- **`src/app/phase-complete/page.tsx:7`** — `getUserAccess` for display only; lower risk.

**Proposed sequencing, your call:** D (delete the file, replace both call sites with entitlement reads) lands *before or inside* the `is_admin` column-drop migration. Doing the migration first would leave the gate reading a dropped column. That is a small amendment to the C→B→D order you confirmed: the column drop travels with D, not with C's REVOKE. C's REVOKE is independent and can go first as agreed.

## 5 · Migration countersign — ready when you are

Your §3 REVOKE is what I'd write, with two additions:

- The server route for legitimate profile updates should be **column-allowlisted**, not just service-role. A service-role route that forwards an arbitrary body reproduces the hole one layer up — the whole finding is that row-scoping without column-scoping is not a guard.
- Add `is_beta_tester` to whatever admin-only path grants it. Once `authenticated` loses the grant, the beta-tester flag needs a legitimate setter, or onboarding the next beta author becomes a manual SQL job.

Countersign the moment you post the DDL.

## 6 · Paul — the commissioning test is authorised but I still cannot run it

Your §1 authorises the transaction+rollback test of the self-grant hole. Thank you — **but this session's write classifier has now refused it twice**, including the read-only version wrapped in `BEGIN … ROLLBACK`. I have not tried to work around it, and I won't.

So finding C remains **grant-and-policy-read evidence only**, not commissioned by effect. Three ways forward, your pick:

- **(a)** Approve the permission prompt when I re-attempt it in chat, and I run it now.
- **(b)** You run it — six lines, and I will supply them verbatim.
- **(c)** We accept the code-read evidence, let `sysadmin` ship the REVOKE, and commission the **fix** instead: after the REVOKE, a self-UPDATE attempt must fail. That test is a *write that must be rejected*, which is a much easier thing to be allowed to run, and it is arguably the test that matters more.

I lean **(c)**. It tests the thing we actually care about, and it needs no authorisation to fail safely.

## 7 · Status

| Item | Status |
|---|---|
| Stripe connector on AuthorsLab | **Closed** — verified |
| Catalogue clean / zero charges | **Closed** — 8 prices ID-matched, seven instruments at zero |
| Pass dead in code + deployed | **Closed** (weaker instrument, §1) |
| No webhook endpoint | **OPEN, P0** — Paul, Dashboard |
| Pass + founding archive | **OPEN** — Paul, Dashboard (key is read-only) |
| C — self-grant hole | Fix with `sysadmin`; effect test blocked (§6) |
| B — checkout wiring | Blocked behind the webhook |
| D — entitlement reads | Ready; now carries the `is_admin` column drop (§4) |
| H — meter matches zero ledger rows | With `finance` (unit ratified) and `astudio` (station contract) |
| KYC/payout, Customer Portal | Paul, Dashboard — not readable via connector |

No code staged this turn. Nothing outstanding in my inbox.

— `identity-billing`
