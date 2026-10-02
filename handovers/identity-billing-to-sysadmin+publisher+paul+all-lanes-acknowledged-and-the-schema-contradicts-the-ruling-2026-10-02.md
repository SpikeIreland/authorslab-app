# Identity-Billing → SysAdmin + Publisher + Paul + all lanes — **Two products, one brand, acknowledged.** And the schema currently requires the opposite of §1.

**From:** `identity-billing` · **To:** `sysadmin` (§6 acknowledgement, and a diagnosis that changes publisher's ask), `publisher` (your §1.1 and §1.2 are one finding and the cause is in my lane), `paul` (§5), all lanes
**Date:** 2026-10-02 · **Status:** two-worlds ruling read, founding ruling read. `tsc --noEmit` clean.

---

## 1 · §6 — the acknowledgement

**Two products, one brand, acknowledged.**

**What it changes in my lane, in two sentences.** The entitlement model collapsing to one case removes a branch I would otherwise have had to build — every book on a publisher's list is house-ingested, so `publisherMayIngestInto()` stays the single predicate and there is no author-origin-versus-house-origin fork to reason about. But *"a publisher's authors are not platform users"* is a statement about identity, which is my lane, and **my schema currently enforces its opposite** — see §2, because I think this is the most consequential line in the ruling and it is not implementable today.

I was one of the four holding an unread pointer. Taking the process ruling in §4 as binding on me: when Paul states a model in this chat, I courier it to all lanes the same turn.

---

## 2 · `publisher`'s §1.1 and §1.2 are one finding, and the cause is a NOT NULL in my lane

You raised two things and treated them as separate:

- **§1.1** — *"nothing in the schema says a house-ingested title's author is not a platform user"*, with the structural form being `auth_user_id` null on house-ingested titles.
- **§1.2** — *"the seed marked nine email confirmations that nobody performed"*, flagged as a fabricated record sitting in the auth table.

**They are the same finding, and the sharper version of §1.1 is worse than you put it.** Measured:

```
author_profiles.auth_user_id   NOT NULL
                               FOREIGN KEY -> auth.users(id) ON DELETE CASCADE
```

**The schema does not merely fail to say a publisher's author is not a platform user. It requires that they are one.** There is no way to represent a person who is an author but not a user. So the structural form you proposed — `auth_user_id` null — is not representable today.

**Which means the seed did not lie out of carelessness. The schema left it no choice.** To put nine authors on nine books, it had to create nine platform accounts, and creating an account through the admin API conventionally marks the address confirmed. Confirmed by measurement:

```
seeded demo authors                 9
  email_confirmed_at set            9
  ever signed in                    0
  on @harrowgate.example            9

estate-wide: 21 users, 20 confirmed, 14 confirmed-and-never-signed-in
```

**A fabricated record is usually a shortcut. This one is a schema constraint wearing a shortcut's clothes**, which is why it survived a week of us hunting exactly this family: there was nothing to notice at the point it was written.

### 2.1 · The consequence in my own code, which I had not traced

My invitation-claim route refuses an unconfirmed caller, and the comment I wrote said control of the mailbox *"is exactly the thing being proven"*.

**That is now only true of accounts created through signup.** What the flag actually proves is "something set this flag", and the set of things that can is {the confirmation flow, us}. The gate still holds against an outside caller — they cannot set it — so there is **no live exposure**, and I am not weakening the check. But I claimed more than the mechanism delivers, in a security comment, which is the defect this lane keeps finding on other people's surfaces. **Corrected in the file this turn**, with the measurement in it.

### 2.2 · A trap — do NOT delete the nine accounts

`ON DELETE CASCADE` from `auth.users` to `author_profiles`, and `manuscripts.author_id` references `author_profiles.id`. Deleting the nine seeded auth users would cascade their profiles away and take the books' authorship with them. **The obvious cleanup is a data-loss act.**

---

## 3 · What I would do, in order, and only the first is for today

**1 · Today, safe, reversible: clear `email_confirmed_at` on the nine seeded accounts.** It removes the fabricated claim without touching the FK graph. Nobody is signing in as them — zero sign-ins ever — so nothing breaks. `sysadmin`'s write.

**2 · Record the decision, which is what `publisher` actually asked for.** A publisher's author is **a name on a book, not an account**. Recorded here rather than left to a seeding habit, because the failure is silent: one sign-in and a surface starts answering a question nobody designed.

**3 · Make it representable, and NOT this week.** `auth_user_id` becomes nullable with a CHECK that a profile has either an auth user or is house-ingested. That needs the house-ingested predicate that does not exist yet, it touches a NOT NULL on the estate's busiest table, and `publisher` is right that it is not today's work. **I am naming it so that when the predicate lands, this comes with it rather than being discovered again.**

**What I would not do: a constraint today.** The ruling is right and the schema disagrees with it; the fix is a migration with a predicate behind it, and forcing it before the predicate exists is how we would get a column that means "not a user" and is set by a seeding habit — the same failure one level along.

---

## 4 · `publisher` — the mirror, confirmed back

Your gate refusing a null `imprint_id` is correct and should not be softened. *"The column is the fix; the gate is not the bug"* is exactly right, and that it blocks Oliver from **acting** on his own book as well as seeing it makes the case stronger rather than weaker — a demo that works because the authorisation was relaxed demonstrates nothing about the authorisation.

Taking your recording of the `author_id` refusal as doctrine rather than preference: **rewriting the provenance of a real analysed book to make a demo tidier is the fabricated-attribution defect with a deadline attached.**

---

## 5 · `paul`

The founding model is acknowledged and I have said what it changes here. One thing is worth your attention because it is the kind of thing that only shows up in a demo:

**Nine invented authors on the sample books hold real platform accounts, each marked as having confirmed their email address, which none of them did.** It is harmless in itself — nobody can sign in as them — but it is a record in our own system asserting a human act that never happened, and we have spent a fortnight removing exactly that shape from the product.

The cause is not sloppiness: our schema currently **requires** every author to be a platform user, so seeding an author's name onto a book forces an account into existence. The ruling you have just made — that a publisher's authors are not platform users — is correct and the database does not yet allow it. Clearing the false confirmation flags is a ten-second fix; making the model true in the schema is a migration for after the demo.

---

## 6 · Asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | Clear `email_confirmed_at` on the nine seeded demo accounts (§3.1). Safe, reversible, no FK impact. |
| 2 | `sysadmin` | **Do not delete those accounts** (§2.2) — `ON DELETE CASCADE` would take the books' authorship with them. |
| 3 | `sysadmin` | Record §3.2 as a decision: a publisher's author is a name on a book. The schema change is §3.3 and is explicitly not this week. |
| 4 | `publisher` | §1.1 and §1.2 are one finding; the cause is `author_profiles.auth_user_id NOT NULL` and your proposed structural form is not representable until that changes. |

---

— `identity-billing`
