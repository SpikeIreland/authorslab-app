# Identity-Billing → Paul (+ SysAdmin, + Finance) — Stripe activation runbook, and why no webhook exists: the key swap never happened either

**From:** `identity-billing` · **To:** `paul` · **cc:** `sysadmin`, `finance` · **Date:** 2026-09-22
**Status:** root cause found. The runbook below is the full path from here to a working, verified Stripe integration.

## The finding that explains the last one

My previous courier reported no webhook endpoint on `acct_1U0u4gEGeehw2YKO`. Checking Vercel's env metadata for the production `authorslab-app` project shows why — **the whole "wire the new account" step of the Launch Handover was skipped, not just the webhook.**

| Env var | Created | Last edited |
|---|---|---|
| `STRIPE_SECRET_KEY` | 2025-11-05 | **2025-11-07** |
| `STRIPE_WEBHOOK_SECRET` | 2025-11-05 | never |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 2025-11-05 | never |
| `NEXT_PUBLIC_BASE_URL` | — | 2025-11-07 |
| **AuthorsLab Stripe account + catalogue created** | **2026-08-05** | |

**The Stripe keys in production predate the AuthorsLab Stripe account by roughly nine months.** They have not been edited since 2025-11-07. An env var cannot be changed outside Vercel, so these cannot be AuthorsLab keys: **production is still wired to the old Spike Island account.**

Launch Handover §2.1 said *"swap Stripe keys to the new account"* and §2.3 said *"new endpoint registration + signing secret on the NEW account."* Neither was done. The catalogue was built on 2026-08-05 and the app was never pointed at it. That is one omission with two faces, and it makes the estate consistent at last:

- `STRIPE_WEBHOOK_SECRET` is set but no AuthorsLab endpoint exists — because the secret belongs to a **Spike Island** endpoint.
- The AuthorsLab catalogue I verified as clean is a catalogue **the running app has never read**. My "no second catalogue" finding holds for the account; the app has been resolving lookup keys against Spike Island, where handover §4 intended those products to be *archived*.
- Zero charges on AuthorsLab is not just "nobody bought anything" — **nothing could have been bought there**, because no deployed code has ever held a key for it.

**Decisive check, ten seconds, for Paul:** Vercel → Project → Settings → Environment Variables → reveal `STRIPE_SECRET_KEY`. Stripe live secret keys carry an account-specific suffix; compare it against the API keys page of each account. If it matches Spike Island, this is confirmed by effect and the runbook below is the fix. I cannot decrypt env values from here and did not try.

**Doctrine, third time on two products:** *a handler is not an integration, and neither is a catalogue.* Products, prices, handler code, signing secret and env var were each individually fine. Nothing connected them, and every downstream check looked healthy because each component was internally consistent.

## Good news: the apex does NOT redirect

The trap I warned about does not apply here. Vercel production domains for `authorslab-app`:

| Domain | Redirect |
|---|---|
| `authorslab.ai` | **none** |
| `www.authorslab.ai` | **none** |
| `ghostwriter.authorslab.ai` | none (subdomain shim → `/wright` in middleware) |
| `authorslab-app.vercel.app` | none |

All four verified, `redirect: null` on every one, and `next.config.ts` carries only `/ghostwriter → /wright` path redirects — nothing host-level. **So `https://authorslab.ai/api/webhooks/stripe` is a safe webhook URL.** This is the opposite of Clarence, where the apex 307'd to www and Stripe silently dropped 78 days of events.

## The runbook

Ordered by dependency. Steps 1–4 are the integration; 5–6 are trading readiness. All vendor writes are yours — my connector key is read-only.

### 1 · Swap the Stripe keys to the AuthorsLab account — do this FIRST
Stripe Dashboard, **AuthorsLab account** (`acct_1U0u4gEGeehw2YKO`) → Developers → API keys. Then in Vercel → `authorslab-app` → Settings → Environment Variables, replace for **Production, Preview and Development**:
- `STRIPE_SECRET_KEY` → AuthorsLab live secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → AuthorsLab live publishable key

Nothing else works until this is done. Leave the Spike Island account **open** — refunds on historical purchases must be issued from the account that took the payment (handover §4).

### 2 · Register the webhook endpoint
AuthorsLab account → Developers → Webhooks → Add endpoint.
- **URL:** `https://authorslab.ai/api/webhooks/stripe`
- **Events — exactly these six**, matching the handler's switch:
  `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- Copy the **signing secret** → Vercel `STRIPE_WEBHOOK_SECRET`, replacing the Spike Island value.

### 3 · Redeploy, then COMMISSION BY EFFECT
Env changes do not reach a running deployment. Redeploy production, then from the Stripe webhook page use **"Send test webhook"** → `checkout.session.completed`.

Pass condition, and nothing less counts:
- Stripe's endpoint page shows the delivery with a **2xx**, and
- Vercel runtime logs show `[stripe-webhook] received event=checkout.session.completed id=evt_…`

**The log line is the real test.** The handler returns `200` even when its internals throw — by design, which means a 2xx on Stripe's side proves transport only. The log line proves arrival. That distinction is exactly what cost Clarence 78 days.

### 4 · Archive the two dead prices
AuthorsLab account → Product catalogue:
- **Pass:** archive product `prod_V0w8X6baFdikVh` and price `price_1U0uGXEGeehw2YKOdyx4xL4j`
- **Founding tier:** archive **price `price_1U0uGdEGeehw2YKOJOrETaRF` ONLY**

> **Do NOT archive `prod_V0w7YdIojLrioZ`.** That is the live **AuthorsLab Author** product; `author_monthly` (£19) and `author_annual` (£156) hang off it. Archiving the product takes your Author tier down with it. Archive the £9.50 price, leave the product alone.

I read back both archives and `finance` countersigns (their §5.3).

### 5 · Verification and payouts — blocks money reaching you
Settings → Business → complete KYC and add the payout bank account. Payouts are blocked until verified and charges may be limited. Not a gate for testing; absolutely a gate for trading.

### 6 · Customer Portal and revenue recovery
Settings → Billing → Customer Portal: enable, allow cancel + plan switch **among the six public prices**, and **exclude `author_founding`** from switch options. Then enable Smart Retries, automatic card updates and dunning emails; set the statement descriptor to `AUTHORSLAB`; enable email receipts; enable cards + Link + Apple Pay + Google Pay.

Also confirm `NEXT_PUBLIC_BASE_URL` is `https://authorslab.ai` — it was last edited 2025-11-07 and it builds every `success_url` and `cancel_url`. A stale value sends paying customers to the wrong host after checkout.

### Still not sellable after all six

To be plain: completing this runbook makes the **billing rail** work. It does not make anything purchasable, because no page can open a Checkout Session (estate note §B — zero `lookupKey` senders, `/pricing` has no checkout CTA). That is finding B, it is mine, and it is queued behind the P0 self-grant fix per the agreed C→B→D order.

The sequencing point stands and now has teeth: **B must not ship before step 3 passes.** If a checkout button goes live while the app holds a Spike Island key and no endpoint exists, the customer is charged on the wrong account and provisioned nowhere.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | Paul | Reveal `STRIPE_SECRET_KEY` and confirm which account it belongs to — turns this from metadata inference into fact |
| 2 | Paul | Steps 1–4; I verify each by read-back before reporting done |
| 3 | `sysadmin` | Note for the record: Launch Handover §2.1 and §2.3 were both skipped. Worth a standing check that vendor-wiring items carry an observed-effect tick, not a checkbox |
| 4 | `finance` | Your V0.5 model can treat AuthorsLab revenue history as structurally zero — no deployed code has ever held a key for that account |

— `identity-billing`
