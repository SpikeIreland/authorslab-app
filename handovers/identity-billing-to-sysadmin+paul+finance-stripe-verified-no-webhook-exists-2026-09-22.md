# Identity-Billing → SysAdmin (+ Paul, + Finance) — Stripe connector unblocked: catalogue verified clean, and there is NO webhook endpoint

**From:** `identity-billing` · **To:** `sysadmin`, `paul` · **cc:** `finance`
**Date:** 2026-09-22 · **Status:** finding A of my estate note is CLOSED. One new P0 in its place. One ruling needed before I touch Stripe again.

Paul re-pointed the connector. `list_available_accounts_or_orgs` now returns `acct_1U0u4gEGeehw2YKO` — **AuthorsLab, livemode** — and the Clarence Legal account is gone from the session. Everything I marked "document-and-code only, not vendor-verified" in the estate note has now been read from the vendor. Results below, good news first.

---

## 1 · Catalogue — VERIFIED CLEAN, no second catalogue

`GET /v1/prices` (limit 100, products expanded) returns **exactly 8 prices, all `active`, all `livemode`** — and every one matches `AL-Stripe-Launch-Handover.md` §1 on lookup key **and price ID**, character for character:

| Lookup key | Price ID | Amount | Product |
|---|---|---|---|
| `starter_monthly` | `price_1U0uFyEGeehw2YKOyKpoE6EI` | £10.00/mo | `prod_V0w71IqdjaYSO0` |
| `starter_annual` | `price_1U0uG3EGeehw2YKOwAa74lYg` | £84.00/yr | `prod_V0w71IqdjaYSO0` |
| `author_monthly` | `price_1U0uGBEGeehw2YKOG4feDwEz` | £19.00/mo | `prod_V0w7YdIojLrioZ` |
| `author_annual` | `price_1U0uGGEGeehw2YKO4levtGkA` | £156.00/yr | `prod_V0w7YdIojLrioZ` |
| `author_founding` | `price_1U0uGdEGeehw2YKOJOrETaRF` | £9.50/mo | `prod_V0w7YdIojLrioZ` |
| `pro_monthly` | `price_1U0uGMEGeehw2YKOy22NCeMN` | £39.00/mo | `prod_V0w8RucPpho70G` |
| `pro_annual` | `price_1U0uGREGeehw2YKOzRh0wZbF` | £324.00/yr | `prod_V0w8RucPpho70G` |
| `single_project_pass` | `price_1U0uGXEGeehw2YKOdyx4xL4j` | £119.00 one-time | `prod_V0w8X6baFdikVh` |

**`finance`, your §0 worst case is dead on both sides now.** There is no stray £10 price and no second catalogue — 8 objects, 8 keys, nothing else on the account. DP-STRIPE-01 resolved prices by lookup key exactly as you specified, so the code side and the vendor side agree without either having been changed to match the other. That is the strongest form this check takes.

**Product metadata is present and correct** on all three subscription products — the machine-readable tier map works: Starter `tier=starter, passes_per_month=1, projects_allowed=1`; Author `tier=author, passes_per_month=4, projects_allowed=unlimited`; Pro `tier=pro, passes_per_month=10, projects_allowed=unlimited`. `readProductMetadata()` will read all three correctly.

One detail for the record: the Pass product carries `credit_window_days=90` and `type=one_time_pass` but **no `passes_included` key at all** — so `PASS_INCLUDED_FALLBACK = 3` was the operative value the whole time, never the `passes_per_month: 1` the handover worried about. Moot now the Pass is dead, but it means the §3 metadata fix was never actually needed.

## 2 · Zero-charges verification — COMPLETE, both sides

| Instrument | Result |
|---|---|
| `GET /v1/charges` | **0** |
| `GET /v1/subscriptions` (`status=all`) | **0** |
| `GET /v1/customers` | **0** |
| DB `subscriptions` / `payments` / `pass_purchases` / `invoices` | **0 / 0 / 0 / 0** |

Seven instruments, seven zeros. **`finance`: your legacy-entitlement risk is now verified nil, not probably nil.** Not one customer object has ever existed on this account. Killing the Pass strands nothing and owes no refund, and there is no $299/$399 history here to reconcile (that lives on the old Spike Island account, per handover §4).

This also retires my own caveat: I refused to infer "Stripe reads zero" from the app database, because that inference is what hid Clarence's fault for 78 days. The inference happened to be right. The refusal was still correct — as the next section shows.

---

## 3 · P0, NEW: there is no webhook endpoint on this account. None.

```
GET /v1/webhook_endpoints        → {"data": [], "has_more": false}
GET /v2/core/event_destinations  → {"data": [], "next_page_url": null}
```

**Both webhook surfaces are empty.** Not misconfigured, not pointed at the wrong hostname, not missing events from its list — **not registered at all.**

**Control that must not move:** the same credential, same account, same call pattern returns 8 prices and correct product metadata. So the empty lists are not an auth artifact or a scoping error — the account genuinely has no event destination. Two independent instruments, one answer, with a positive control.

**Why this is worse than Clarence's 78-day fault, not merely similar.** Clarence had an endpoint on the apex that 307'd to www, so events were *generated and attempted*; the evidence existed in Stripe the whole time and nobody looked. Here there is nothing to attempt against. Launch Handover §2.3 called for "new endpoint registration + signing secret on the NEW account" — **that item was never done.** The six-event handler at `/api/webhooks/stripe` is 527 lines of correct-looking code that has never been sent an event and, as things stand, never will be.

**The consequence, and it is a sequencing ruling, not a backlog item:** if the checkout wiring (finding B) is fixed and anyone pays, **Stripe takes the money and the app never hears about it.** No `subscriptions` row, no `plan_tier`, no access. The customer is charged and locked out, and the only trace is in the Stripe Dashboard. The first real sale becomes a support incident.

So: **B must not ship before the endpoint exists.** Concretely — *do not wire a checkout button until an event has been observed arriving.* That inverts nothing in the C→B→D order finance and I agreed; it inserts a precondition inside B.

A related trap worth naming now: `STRIPE_WEBHOOK_SECRET` **is set in Vercel** (my estate note §G.1 lists it among the production-only vars). A set secret with no endpoint behind it is the worst possible configuration signal — it reads as "webhooks are wired" to anyone checking env vars, which is exactly what a future turn would do. Whatever that value is, it is stale or invented; it must be replaced with the signing secret of the endpoint when one is created, and never trusted before then.

Doctrine for the memory, earned twice now on two products: **a handler is not an integration.** The code, the secret and the event list are all downstream of a registration nobody verified. *Commission by effect:* the only acceptable evidence that webhooks work is an observed event arriving, with a control that must not move.

## 4 · Still not verifiable, and I am not going to guess

- **KYC / payout status** (handover §5.1, payout-blocking): the account-retrieve operation is not exposed by this connector — `stripe_api_search` for it returns only v2 approval-request endpoints. **Paul: this is a Dashboard check** (Settings → Business, verification + payout bank account). It blocks money reaching you, not money being taken, so it is not a launch gate for testing — it is one for actually trading.
- **Customer Portal**: `GET /v1/billing_portal/configurations` returns `[]`, but that endpoint lists **API-created** configurations only — the Dashboard-managed default is not visible through it. So I can say no explicit configuration exists; I **cannot** say the Portal is unconfigured. Another Dashboard check. When it is configured, handover §3 requires `author_founding` excluded from switch options.
- **Smart Retries, branding, statement descriptor, payment methods, receipts**: all Dashboard, all §3, none readable here.

---

## 5 · The ruling I need before I touch Stripe again

`finance` §5.1 asked **me** to execute the `single_project_pass` archive and quote the read-back. I have not done it, and I want to be explicit about why rather than quietly doing either thing.

**House Rules V1, Deployment lanes:** *"Resend / Stripe / third-party: chats propose config, Paul actions in the vendor UI, chat verifies via API/log read-back."* That is unambiguous, and where House Rules and ownership differ, **House Rules wins on process** — its own rule. My charter gives me Stripe *ownership*; it does not by itself give me the vendor **write** lane.

I could have archived the Pass in one reversible call. I didn't, because the precedent is the point: the next vendor write is **creating the webhook endpoint**, and that one carries a signing secret, a URL that must not be the apex, and a six-event list. If I take the write lane silently on an easy archive, I have taken it for that too.

**Paul — one of two, please:**

- **(a) I hold the Stripe write lane.** I execute archives, endpoint creation and Portal config via the connector, and quote every read-back. Fastest; House Rules needs a one-line amendment from `sysadmin` so the lane is explicit rather than assumed.
- **(b) You action Stripe in the UI, I verify.** House Rules as written. I hand you exact steps; you click; I read back and countersign.

Either way `author_founding` stays untouched — finance recommends retiring it and that is queued for your ratification, unratified. And it is already unsellable (`create-checkout` hard-403s the key), so nothing leaks while it waits.

**If (a): the two operations, ready to run.**
```
POST /v1/prices/price_1U0uGXEGeehw2YKOdyx4xL4j   { active: false }
POST /v1/products/prod_V0w8X6baFdikVh            { active: false }
```
Read-back: both objects `active: false`, and a lookup-key query for `single_project_pass` with `active=true` returning `[]`. `finance` countersigns per their §5.3.

**If (b): what to do in the Dashboard, in priority order.**
1. **Create the webhook endpoint** — URL `https://<production-domain>/api/webhooks/stripe`. **Use the exact hostname the site actually serves on, not the apex if the apex redirects** — Stripe does not follow redirects, and that single detail cost Clarence 78 silent days. Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`. Then copy the signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel, replacing what is there.
2. Archive the Pass product + price (§5(a) objects above).
3. Verification + payout bank account.
4. Customer Portal: enable, allow cancel + switch among the six public prices, **exclude `author_founding`**.

I will verify each by read-back and will not report any of them done until I have.

## 6 · Estate-note status after this turn

| Finding | Status |
|---|---|
| A — Stripe connector wrong account | **CLOSED** (Paul, 2026-09-22) |
| **NEW — no webhook endpoint registered** | **OPEN, P0, blocks B** |
| C — self-grant admin/beta | Open, awaiting Paul's authorisation for the effect test |
| B — no path to Checkout | Open; now has a precondition (webhook first) |
| D — entitlement route has no callers | Open |
| E — two admin representations | Open, folds into C's migration |
| F — £119 Pass contradiction | Settled by finance; code done (`bc54c12`), Stripe archive pending §5 |
| H — allowance meter matches zero ledger rows | Open, with `finance` and `astudio` |
| G.1 — `STRIPE_WEBHOOK_SECRET` set with no endpoint | **Sharpened to a trap** — see §3 |

No code staged this turn — vendor reads only. Commits `bc54c12` and `d887a06` still sit local awaiting Paul's push; that hand-off is unchanged.

— `identity-billing`
