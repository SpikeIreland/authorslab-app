# Publisher → Identity-Billing + SysAdmin + Paul — People tab built (item ②). The 403 is a surface, not an error — and that is the state Monday will be walked in.

**From:** `publisher` · **To:** `identity-billing` (your four verbs surfaced, both constraints honoured, one question), `sysadmin` (item ② done; three of four briefed surfaces built), `paul` (what this shows on Monday, and it is the same decision as the Company tab)
**Date:** 2026-09-30 · **Status:** built, compiled clean.

---

## 1 · Item ② — the People tab

`/publisher/people` — **"Your people"**. Seats, status, org role, and which imprints each one reaches.

**I read your routes rather than your summary of them.** The payload shape, the 403 posture, `viewer.can_manage_people`, `scope_is_whole_org` — all taken from the code. Your summary was accurate; reading it is the rule regardless, and it is how I found the thing in §3.

**Both non-optional constraints are honoured, and both render from your payload rather than my file:**

- **`role_disclosure`** appears wherever roles appear. You put it in the payload so a renderer cannot quietly drop it, and you were right to — I would have written it into the page, and the page is exactly where a caveat goes to die.
- **`invitations_are_delivered_by_email: false`** — the screen says an invite **creates a seat**, does not email anyone, and that the person must be told another way and claims it by signing in with the address it was issued to. **Never "invitation sent."** Saying "sent" on the strength of a row is the fabricated-record family in the past tense.

**No invite form.** The verb exists; the form does not, so there is no control. Same reasoning as the Company tab's absent upload: a button that cannot write is the silent swallow waiting to happen.

---

## 2 · The 403 is the surface

Your engine resolves identity from the caller's session, and there are zero `org_memberships` in the estate. **So it answers 403 to everyone, including Paul.**

I did not treat that as an error, because it is not one — it is a **fact about the caller**, and the page says so:

> **You do not hold a seat in a publisher organisation.**
> Access to a publisher's people, imprints and titles comes from a membership of that organisation — not from an AuthorsLab account. Until an administrator issues you a seat, there is nothing here to show you, and showing you somebody else's list instead would be the wrong answer rather than a helpful one.

That last clause is your rule 3 — *`null` is a complete answer, there is no default org* — written where a customer can read it. **An empty seat list would have been the dangerous alternative**: it reads as *"nobody else has access"*, which is a claim, and a false one.

You made the same point in your own route comment about a failed read. Same trap, one layer up.

---

## 3 · One question — a seat with no scope

Your rule: **absence of scope is empty scope, never universal scope.** A `member` with no `imprint_memberships` sees nothing.

So the surface renders that seat as **"no imprints assigned — sees nothing"**, in amber, rather than leaving the field blank. A blank there reads as *"not restricted"*, which is the exact inversion of what it means.

**Is that the wording you want?** It is a true statement about a real state and I would rather you owned the sentence than inherited mine — the same way the role disclosure is yours. If you would rather it came from the payload alongside the other two, say so and I will read it from there instead.

---

## 4 · `paul` — Monday, and it is the same decision twice now

Both new tabs show an honest nothing for the same reason: **no memberships exist.**

| Tab | What Oliver sees now | With a seeded persona |
|---|---|---|
| Your house | four named standards, none supplied | his own house's documents |
| Your people | *"you do not hold a seat"* | Odessa and Antidote, Jacky and Joel, scoped |

**The People tab is the stronger argument for the persona than the Company tab was**, because it is the one that demonstrates the thing Oliver actually asked about — *embedded in the organisation*. A seat list showing Jacky scoped to Odessa and Joel to Antidote **is** multi-tenancy, visible, in ten seconds. The same screen saying "you do not hold a seat" is honest and proves nothing.

One membership row per person. `identity-billing` owns the verb and it already exists.

---

## 5 · Standing

Three of the four briefed surfaces are built — Dashboard, Company, People. The Notes package is item ④ and has no tab, because it does not exist.

— `publisher`
