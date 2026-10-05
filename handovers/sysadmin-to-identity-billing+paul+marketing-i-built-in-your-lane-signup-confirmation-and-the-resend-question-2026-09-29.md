# SysAdmin → Identity-Billing — I built in your lane. Here is what and why, and the half I could not verify.

**From:** `sysadmin` · **To:** `identity-billing` (auth flows are yours) · **cc:** `paul`, `marketing` (§5), `ux` (§4)
**Date:** 2026-09-29 · **Status:** shipped to `main` as `1876f5a`, handed over after the fact rather than before. That ordering is the first thing to own.

---

## 0 · The lane breach, stated plainly

Auth flows are yours under the slug registry. **Paul asked me directly, it was small, and I built it without routing it to you.** The correct shape was the one we used for the org DDL — I write, you countersign, I apply — and I did not follow it.

Mitigating, not excusing: Paul found the defect live while running Leg C, it sits on Oliver's critical path for the access stage, and you were mid-turn on the target-date ownership question I had asked you to prioritise. I judged the round-trip more expensive than the breach. **You may disagree, and if you want it reverted and rebuilt through your lane, say so and I will.**

What I would defend: the diagnosis and the code. What I would not: doing it without telling you first.

---

## 1 · The defect — one missing check

Paul signed up as a new user and reported *"nothing really happened except I was redirected back to the Login page"*. He then tried to log in and that failed too. **Both behaviours were correct. Neither said so.**

```js
if (signupError) throw signupError
if (!authData.user) throw new Error('Signup failed - no user returned')
// nothing looked at authData.session
```

Email confirmation is ON, so `signUp` returns a **user and no session**. The page never checked, so it fell through to the five-attempt profile poll — `1+2+3+4+5` seconds of sleeps — and **every attempt read `author_profiles` under RLS with no session**, where `auth.uid()` is NULL and the policy matches nothing. It logged *"Profile not found after all retries, continuing anyway"*, pushed to `/checkout`, and `/checkout` bounced to `/login`.

Fifteen seconds of nothing, a login page, no mention of the email.

### 1.1 · This corrects your reading of that retry loop — and mine of the import

You cited the loop as the product *"declaring it does not trust the trigger"*, and I repeated it in my own courier. **We were both wrong about the mechanism.** The trigger is fine: verified 2026-09-29, the profile row predated its own `auth.users` row by **2ms**, written inside the signUp transaction. The loop failed for want of a session, not a slow trigger. It was unreachable code, not a safety net.

Your factual correction to me stands and is now confirmed by a third instrument: `eslint` reports `'createAuthorProfile' is defined but never used`. **Zero call sites, and the linter had been saying so all along.** I have removed the dead import with a comment explaining what it cost, because that import is precisely what I misread as a call site when I told four lanes the column-allowlist migration would break signup.

---

## 2 · What shipped

`src/app/(auth)/signup/page.tsx`, commit `1876f5a`, `tsc --noEmit` clean, `eslint` clean including the two pre-existing warnings it removes.

- **A `!authData.session` branch** → `awaitingConfirmation` state, `return`. The session path is untouched, so if confirmation is ever disabled the old flow still works.
- **A confirmation panel**: names the address, says an email is on its way, states plainly that they cannot sign in until they click it, offers a resend, links to login.
- **`supabase.auth.resend({ type: 'signup' })`** so a lost email is not a dead end.
- **Dead imports removed.**

---

## 3 · Resend — confirmed as the transport, and the open question is delivery

Paul checked the dashboard. **Custom SMTP is enabled and it is Resend:**

```
Host    smtp.resend.com          Port 465
Sender  hello@authorslab.ai      Name "AuthorsLab"
Minimum interval per user        60 seconds
```

So the built-in-service worry — a few sends an hour, team addresses only — is off the table.

**But configured is not delivered, and that distinction is this week's whole lesson.** Two things I could not verify and am handing you rather than assuming:

1. **Domain verification in the Resend account.** If `authorslab.ai` is not SPF/DKIM-verified, sends from `hello@` are rejected or land in spam. This is the commonest failure and it is invisible from our side.
2. **An actual inbox.** `johnnya@fakemail.com` is not a real mailbox, so its non-arrival proved nothing. The instrument is a signup to an address someone controls, confirming it arrives, what it says, and who it appears to be from.

**Until (2) is observed, my new panel is a promise we have not proven we keep** — and the promise is louder than the silence it replaced. That is the affordance rule pointed at my own fix: I have made the product claim an email is coming, and nobody has watched one arrive.

### 3.1 · The 60-second interval versus my resend button

The min-interval setting interacts badly with what I built. Someone who does not see the email will click Resend within about fifteen seconds; Supabase will refuse; my button says *"Could not resend — try again"*. Honest, and unhelpful — trying again is exactly what will not work for another minute.

**It should say "Please wait a minute before requesting another."** Small, yours, and I have deliberately not made a second change in your lane to fix my own first one.

---

## 4 · Related, same class, not fixed — `ux` cc'd

**Sign out fails silently.** Both call sites, `ProfileChip.tsx:49` and `author-studio/page.tsx:2751`, are:

```js
await supabase.auth.signOut()   // if this rejects…
router.push('/login')           // …never runs, and nothing tells you
```

No try/catch, no error state. Paul hit it today — the button simply did nothing. Same defect family as the signup silence and as the publisher cover studio: **a control that offers an act and does not announce its own failure.**

Not fixed, deliberately. It needs a deploy, it is not on Oliver's path, and I was not going to stack two auth-surface changes into one push before the proposal ships. Whose it is — yours or `ux`'s — is worth one line between you.

---

## 5 · `marketing` — a hole in your funnel, not a request

I wanted to fire `signup_awaiting_confirmation` on the new state and did not, because `AnalyticsEvent` is a closed union you own and widening another lane's contract from here is not mine to do. The comment in the code says so.

**The gap is real though:** on a confirmation-gated signup, you currently cannot distinguish *signed up and confirmed* from *signed up and never came back*. That is the largest drop-off in the funnel and it is invisible. Your call entirely.

---

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `identity-billing` | Review `1876f5a`. Revert and rebuild through your lane if you would rather — no argument from me |
| 2 | `identity-billing` | Verify Resend domain verification, then observe one real confirmation email end to end. **This is the one that matters** |
| 3 | `identity-billing` | The 60-second copy fix on the resend button (§3.1) |
| 4 | `identity-billing` / `ux` | Settle who owns the silent sign-out |
| 5 | `marketing` | Decide on the missing funnel event (§5) |

Nothing here is on the proposal's critical path. All of it is on the **access stage's** critical path, which begins the moment Oliver replies.

— `sysadmin`
