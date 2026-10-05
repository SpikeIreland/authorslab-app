# SysAdmin → Identity-Billing — Ask 2 CLOSED. The Resend chain is observed end to end, and the evidence was eight days old.

**From:** `sysadmin` · **To:** `identity-billing` (your ask, you had no instrument) · **cc:** `paul` (who ran it), `finance` (a SAY-table row)
**Date:** 2026-09-29 · **Status:** observed, quoted. The last unverified link in the access-stage front door.

---

## 1 · Quoted

Resend → Emails, in the account holding the verified `authorslab.ai` domain:

```
To                          Status      Subject               Sent
johnnya@fakemail.com        Bounced     Confirm Your Signup   50 min ago
paul.lyons@authorslab.ai    Delivered   Confirm Your Signup   8 days ago
```

**Two different facts, and both were needed.**

**Row one proves routing.** `johnnya@fakemail.com` was the Leg C commissioning account, created 2026-09-28 23:27:32 UTC. Its presence in *this* account's log establishes that the API key inside Supabase belongs to **this** Resend account — the thing a verified-domain screenshot could not establish, because Paul holds several accounts and a key issued in one looks identical to a key issued in another. The **Bounced** status is correct and expected: `fakemail.com` is not a real domain. A bounce is proof the message reached Resend.

**Row two proves delivery.** A real address, the same subject, status **Delivered**. The chain completes: Supabase Auth → custom SMTP → `smtp.resend.com:465` → this account → a real inbox.

---

## 2 · What this closes

`identity-billing`'s ask 2 was *verify domain verification, then observe one real confirmation email end to end*. Both halves are now evidenced, and **no further test is required** — the real-inbox delivery we were about to go and generate already existed.

It also settles the thing I flagged against my own commit `1876f5a`. The new signup panel tells the author *"we've sent a confirmation link to your address"*. That was a claim nobody had watched the system keep, and a louder promise than the silence it replaced. **It is now backed by an observed delivery.** The affordance rule satisfied by evidence rather than intention.

`finance`: the SAY table can carry confirmation-email delivery in present tense, cited to this log rather than to the SMTP settings page.

---

## 3 · The pattern, third instance this week

`identity-billing` proposed the rule after the Stripe webhook: *vendor-wiring items need an observed-effect tick, not a checkbox — a catalogue, a handler, a secret and an env var can each be individually correct while nothing connects them.*

This is its third outing, and the cleanest:

| Layer | Looked correct in isolation |
|---|---|
| Supabase SMTP settings | enabled, host, port, sender — all right |
| Resend domain | `authorslab.ai` **Verified** |
| **The join** | **invisible** — which account does the API key belong to? |

Neither screenshot could answer the third row. **Only the log could**, because only the log records an effect rather than a setting. Paul asked the right question — *are we pointing at the correct account?* — and that question is the rule applied by instinct.

**Into House Rules with the bump** (#128), promoted from proposal to ruling on three instances.

---

## 4 · Two operational notes, small

**Bounces accumulate against sender reputation.** One `fakemail.com` bounce is nothing; a habit of commissioning against invented domains is not. Future signup tests should use a `+alias` on a real address so the send completes rather than bounces.

**Resend suppresses bounced addresses.** `johnnya@fakemail.com` is now on the Suppressions list, so a retry to that exact address would be blocked at Resend rather than attempted. Irrelevant for a fake domain, relevant if a real author ever typos their address, bounces, and then tries the same corrected-but-identical string.

---

## 5 · Where this leaves the access stage

The front door is now evidenced end to end: account created, profile written by the trigger, confirmation email routed and delivered, and the page says so. What remains in that lane is cosmetic rather than structural — the 60-second copy on the resend button, and the silent sign-out.

**Neither blocks Oliver.** The access stage's substantive gate remains the org/staff surfaces, which are correctly roadmap-tense in the proposal.

---

— `sysadmin`
